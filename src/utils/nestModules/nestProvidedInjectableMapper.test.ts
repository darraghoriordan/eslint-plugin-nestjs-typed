import {TSESLint, TSESTree} from "@typescript-eslint/utils";
import {typedTokenHelpers} from "../typedTokenHelpers.js";
import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap.js";
import nestModuleAstMapper from "./nestProvidedInjectableMapper.js";
import fs from "fs";
import os from "os";
import path from "path";
import {
    fakeContext,
    fakeFilePath,
    moduleMappingTestData,
} from "./nestProvidedInjectableMapper.testData.js";

describe("nest module ast mapper", () => {
    it("Can parse typescript typings using the typescript parser", () => {
        const result = typedTokenHelpers.parseStringToAst(
            `let x:Date = new Date()`,
            fakeFilePath,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            {
                parserOptions: {
                    ecmaVersion: 2019,
                    ecmaFeatures: {globalReturn: false},
                    sourceType: "module",
                } as TSESLint.ParserOptions,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
        );

        const typeAnnotation = (result.body[0] as TSESTree.VariableDeclaration)
            .declarations[0].id.typeAnnotation;

        expect(result).not.toBeUndefined();
        expect(
            (
                (typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference)
                // prettier-ignore
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .typeName as any
            // prettier-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ).name
        ).toEqual("Date");
    });
    test.each([moduleMappingTestData])(
        "Can parse a module",
        (testItem: {
            moduleCode: string;
            expectedMapping: (string | NestProvidedInjectablesMap)[];
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testItem.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const modules =
                nestModuleAstMapper.mapAllProvidedInjectablesInModuleOrProviderFile(
                    ast,
                    fakeFilePath
                );
            expect(modules).toEqual(testItem.expectedMapping);
        }
    );
});

describe("parseFileList", () => {
    it("maps metadata with typescript-estree without type-aware parser settings", () => {
        const tempDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), "nestjs-module-mapper-")
        );
        const sources = [
            {
                filename: path.join(tempDirectory, "module.ts"),
                code: moduleMappingTestData[0].moduleCode,
            },
            {
                filename: path.join(tempDirectory, "custom-provider.ts"),
                code: moduleMappingTestData[1].moduleCode,
            },
            {
                filename: path.join(
                    tempDirectory,
                    "controller-provider.module.ts"
                ),
                code: `
                    import {Module} from "@nestjs/common";
                    @Module({
                        controllers: [SyntheticController],
                        providers: [SyntheticProvider],
                    })
                    export class SyntheticModule {}
                `,
            },
            {
                filename: path.join(tempDirectory, "types.ts"),
                code: "export type SyntheticType = {value: string};",
            },
            {
                filename: path.join(tempDirectory, "plain.ts"),
                code: "const plainFile = true;",
            },
        ];
        for (const {filename, code} of sources) {
            fs.writeFileSync(filename, code);
        }
        const files = sources.map(({filename}) => ({ignored: false, filename}));
        const context = {
            parserOptions: {
                project: path.join(tempDirectory, "missing-tsconfig.json"),
            },
        } as unknown as Readonly<TSESLint.RuleContext<never, never[]>>;

        try {
            const actual = nestModuleAstMapper.parseFileList(files, context);
            const expected = new Map<string, NestProvidedInjectablesMap>();
            for (const {filename, code} of sources) {
                const ast = typedTokenHelpers.parseStringToAst(
                    code,
                    filename,
                    context
                );
                const mapping =
                    nestModuleAstMapper.mapAllProvidedInjectablesInModuleOrProviderFile(
                        ast,
                        filename
                    );
                if (mapping) {
                    expected.set(mapping[0], mapping[1]);
                }
            }

            expect(actual).toEqual(expected);
            expect([...actual.keys()].sort()).toEqual(
                [
                    sources[0].filename,
                    sources[1].filename,
                    sources[2].filename,
                ].sort()
            );
            expect(actual.get(sources[0].filename)).toEqual(
                new NestProvidedInjectablesMap(
                    new Set(["MyController"]),
                    new Set(["MyProvider", "MyInjectable"])
                )
            );
            expect(actual.get(sources[1].filename)).toEqual(
                new NestProvidedInjectablesMap(
                    new Set([]),
                    new Set(["MyOtherInjectable"])
                )
            );
            expect(actual.get(sources[2].filename)).toEqual(
                new NestProvidedInjectablesMap(
                    new Set(["SyntheticController"]),
                    new Set(["SyntheticProvider"])
                )
            );
        } finally {
            fs.rmSync(tempDirectory, {recursive: true, force: true});
        }
    });
});
