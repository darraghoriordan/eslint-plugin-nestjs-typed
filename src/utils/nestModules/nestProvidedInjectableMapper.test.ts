import {TSESTree} from "@typescript-eslint/utils";
import {EcmaVersion, ParserOptions} from "@typescript-eslint/types";
import {typedTokenHelpers} from "../typedTokenHelpers";
import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap";
import nestModuleAstMapper from "./nestProvidedInjectableMapper";
import {
    fakeContext,
    fakeFilePath,
    moduleMappingTestData,
} from "./nestProvidedInjectableMapper.testData";

describe("nest module ast mapper", () => {
    it("Can parse typescript typings using the typescript parser", () => {
        const result = typedTokenHelpers.parseStringToAst(
            `let x:Date = new Date()`,
            fakeFilePath,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            {
                parserOptions: {
                    ecmaVersion: 2019 as EcmaVersion,
                    ecmaFeatures: {globalReturn: false},
                    sourceType: "module",
                } as ParserOptions,
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
            ).name
        ).toEqual("Date");
    });
    test.each([moduleMappingTestData])(
        "Can parse a module",
        (testItem: {
            moduleCode: string;
            expectedMapping: Array<string | NestProvidedInjectablesMap>;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testItem.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const modules = nestModuleAstMapper.mapAllProvidedInjectables(
                ast,
                fakeFilePath
            );
            expect(modules).toEqual(testItem.expectedMapping);
        }
    );
});
