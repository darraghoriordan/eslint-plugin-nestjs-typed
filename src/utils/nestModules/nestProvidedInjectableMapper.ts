import {TSESLint, TSESTree} from "@typescript-eslint/utils";

import * as unambiguous from "eslint-module-utils/unambiguous";
// eslint-disable-next-line import/no-unresolved
import {FilePath} from "eslint/use-at-your-own-risk";
import fs from "fs";
import {typedTokenHelpers} from "../typedTokenHelpers";

import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap";
import {nestModuleAstParser} from "./nestModuleAstParser";
import {nestProviderAstParser} from "./nestProviderAstParser";

const implementsForInjectablesThatAreNotProvided = new Set([
    "CanActivate", //(isAGuard)
    "NestInterceptor", //(isAnInterceptor)
    "PipeTransform", //(isAPipeTransform)
    "NestMiddleware", //(isMiddleware)
]);
const NestProvidedInjectableMapper = {
    detectDirectoryToScanForFiles(
        sourceGlob: string | string[] | undefined,
        currentWorkingDirectory: string
    ): string[] {
        if (sourceGlob && typeof sourceGlob === "string") {
            return [sourceGlob];
        }

        if (sourceGlob && Array.isArray(sourceGlob)) {
            return sourceGlob;
        }
        console.debug(
            "Injectables should be provided is using cwd for scanning. Consider configuring it in eslintrc.",
            {currentWorkingDirectory}
        );
        return [currentWorkingDirectory];
    },
    parseFileList(
        files: Array<FilePath>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context: Readonly<TSESLint.RuleContext<never, any>>
    ): Map<string, NestProvidedInjectablesMap> {
        const moduleMaps = new Map<string, NestProvidedInjectablesMap>();
        files
            .map((f) => {
                const fileContents =
                    NestProvidedInjectableMapper.readFileContents(f.filename);

                const fileAstString = typedTokenHelpers.parseStringToAst(
                    fileContents,
                    f.filename,
                    context
                );

                return NestProvidedInjectableMapper.mapAllProvidedInjectables(
                    fileAstString,
                    f.filename
                );
            })
            // eslint-disable-next-line @typescript-eslint/unbound-method
            .filter(NestProvidedInjectableMapper.notEmpty)
            .forEach((m) =>
                moduleMaps.set(
                    m[0] as string,
                    m[1] as NestProvidedInjectablesMap
                )
            );

        return moduleMaps;
    },
    notEmpty<TValue>(value: TValue | null): value is TValue {
        if (value === null || value === undefined) return false;
        return true;
    },

    readFileContents(path: string): string {
        return fs.readFileSync(path, {encoding: "utf8"});
    },

    isNestInjectableThatIsNeverProvided(
        node: TSESTree.ClassDeclaration
    ): boolean {
        for (const implementsClass of node.implements || []) {
            if (
                implementsForInjectablesThatAreNotProvided.has(
                    (implementsClass.expression as TSESTree.Identifier).name
                )
            ) {
                return true;
            }
        }

        return false;
    },
    mapAllProvidedInjectables(
        ast: TSESTree.Program,
        path: string
    ): Array<string | NestProvidedInjectablesMap> | null {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any

            if (
                // eslint-disable-next-line no-constant-condition
                !unambiguous.isModule(ast)
            ) {
                return null;
            }
            // This does too much and should probably be split up
            // i also assume you would never have multiple of providers, controllers or modules in a file
            // dangerous assumption i guess. i have never seen this done before though.

            // set up the response model
            let nestModuleMap: (string | NestProvidedInjectablesMap)[] | null =
                null;

            // Is this a module?
            const foundNestModuleClass =
                nestModuleAstParser.findNestModuleClass(ast);

            if (foundNestModuleClass) {
                nestModuleMap = nestModuleAstParser.mapNestModuleDecorator(
                    foundNestModuleClass,
                    path
                );
                return nestModuleMap;
            }

            // or is this a custom provider that would provide an instance of the class?
            // if it is we map the itentifier it "provide"s. This will only work if it's an identifier
            // it can't be provider for a string literal "provide".

            const foundProviderDeclaration =
                nestProviderAstParser.findNestProviderVariableDeclaration(ast);

            const provideProperty = nestProviderAstParser.findProvideProperty(
                foundProviderDeclaration,
                "provide"
            );
            if (provideProperty) {
                nestModuleMap = nestProviderAstParser.mapNestProviderObject(
                    provideProperty,
                    path
                );
            }
            return nestModuleMap;
        } catch (error) {
            console.error("parse error:", path, error);
            // m.errors.push(error);
            // return m; // can't continue
            return null;
        }
    },
};

export default NestProvidedInjectableMapper;
