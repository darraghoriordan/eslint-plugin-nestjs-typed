import {TSESLint, TSESTree} from "@typescript-eslint/utils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as unambiguous from "eslint-module-utils/unambiguous";
import fs from "fs";
import {typedTokenHelpers} from "../typedTokenHelpers.js";
import {
    NestProvidedFilePath,
    NestProvidedInjectablesMap,
} from "./models/NestProvidedInjectablesMap.js";
import {nestModuleAstParser} from "./nestModuleAstParser.js";
import {nestProviderAstParser} from "./nestProviderAstParser.js";

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
        files: {
            ignored: boolean;
            filename: NestProvidedFilePath;
        }[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context: Readonly<TSESLint.RuleContext<never, any>>
    ): Map<NestProvidedFilePath, NestProvidedInjectablesMap> {
        const moduleMaps = new Map<
            NestProvidedFilePath,
            NestProvidedInjectablesMap
        >();
        files
            .map((f) => {
                const fileContents =
                    NestProvidedInjectableMapper.readFileContents(f.filename);

                const fileAstString = typedTokenHelpers.parseStringToAst(
                    fileContents,
                    f.filename,
                    context
                );

                const result:
                    | [NestProvidedFilePath, NestProvidedInjectablesMap]
                    | null =
                    NestProvidedInjectableMapper.mapAllProvidedInjectablesInModuleOrProviderFile(
                        fileAstString,
                        f.filename
                    );
                return result;
            })
            // eslint-disable-next-line @typescript-eslint/unbound-method
            .filter(NestProvidedInjectableMapper.notEmpty)
            .forEach((m) => moduleMaps.set(m[0], m[1]));

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
    mapAllProvidedInjectablesInModuleOrProviderFile(
        ast: TSESTree.Program,
        path: string
    ): [NestProvidedFilePath, NestProvidedInjectablesMap] | null {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            if (!unambiguous.isModule(ast as any)) {
                return null;
            }
            // This does too much and should probably be split up
            // i also assume you would never have multiple of providers, controllers or modules in a file
            // dangerous assumption i guess. i have never seen this done before though.

            // set up the response model
            let moduleFileListOfControllersAndProviders:
                | [NestProvidedFilePath, NestProvidedInjectablesMap]
                | null = null;

            // Is this a module?
            const foundNestModuleClass =
                nestModuleAstParser.findNestModuleClass(ast);

            if (foundNestModuleClass) {
                moduleFileListOfControllersAndProviders =
                    nestModuleAstParser.mapNestModuleDecorator(
                        foundNestModuleClass,
                        path
                    );
                return moduleFileListOfControllersAndProviders;
            }

            // or is this a custom provider that would provide an instance of the class?
            // if it is we map the identifier it "provide"s. This will only work if it's an identifier
            // it can't be provider for a string literal "provide".

            const foundProviderDeclaration =
                nestProviderAstParser.findNestProviderVariableDeclaration(ast);

            const provideProperty = nestProviderAstParser.findProvideProperty(
                foundProviderDeclaration,
                "provide"
            );
            if (provideProperty) {
                moduleFileListOfControllersAndProviders =
                    nestProviderAstParser.mapNestProviderObject(
                        provideProperty,
                        path
                    );
            }
            return moduleFileListOfControllersAndProviders;
        } catch (error) {
            console.error("parse error:", path, error);
            // m.errors.push(error);
            // return m; // can't continue
            return null;
        }
    },
};

export default NestProvidedInjectableMapper;
