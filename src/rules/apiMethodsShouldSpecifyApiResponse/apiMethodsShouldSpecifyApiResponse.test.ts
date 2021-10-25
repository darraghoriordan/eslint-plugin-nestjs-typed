import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";
import {TSESTree} from "@typescript-eslint/types";
import {testCases} from "./apiMethodsShouldSpecifyApiResponse.testData";
import {shouldUseApiResponseDecorator} from "./apiMethodsShouldSpecifyApiResponse";

// should probably be split up into multiple tests
describe("apiMethodsShouldSpecifyApiResponse", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            shouldUseDecorator: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const shouldUseOptional = shouldUseApiResponseDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.MethodDefinition
            );
            expect(shouldUseOptional).toEqual(testCase.shouldUseDecorator);
        }
    );
});
