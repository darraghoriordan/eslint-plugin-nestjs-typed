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
    mapDefaultSource(
        sourceGlob: string | string[] | undefined,
        currentWorkingDirectory: string
    ): string[] {
        if (sourceGlob && typeof sourceGlob === "string") {
            return [sourceGlob];
        }

        if (sourceGlob && Array.isArray(sourceGlob)) {
            return sourceGlob;
        }

        return [currentWorkingDirectory];
    },
    parseFileList(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        files: Array<FilePath>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        context: Readonly<TSESLint.RuleContext<never, any>>
    ): Map<string, NestProvidedInjectablesMap> {
        const moduleMaps = new Map<string, NestProvidedInjectablesMap>();
        files
            .map((f) =>
                NestProvidedInjectableMapper.mapAllProvidedInjectables(
                    typedTokenHelpers.parseStringToAst(
                        NestProvidedInjectableMapper.readFileContents(
                            f.filename
                        ),
                        f.filename,
                        context
                    ),
                    f.filename
                )
            )
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
            let nestModuleMap = null;

            const foundNestModuleClass =
                nestModuleAstParser.findNestModuleClass(ast);
            if (foundNestModuleClass) {
                nestModuleMap = nestModuleAstParser.mapNestModuleDecorator(
                    foundNestModuleClass,
                    path
                );
            }
            const foundProviderObject =
                nestProviderAstParser.findNestProviderObjectsProperty(
                    nestProviderAstParser.findNestProviderObject(ast),
                    "provide"
                );
            if (foundProviderObject) {
                nestModuleMap = nestProviderAstParser.mapNestProviderObject(
                    foundProviderObject,
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
