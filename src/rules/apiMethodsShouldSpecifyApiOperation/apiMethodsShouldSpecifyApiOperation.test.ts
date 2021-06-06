import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.test-date";
import {TSESTree} from "@typescript-eslint/types";
import {testCases} from "./apiMethodsShouldSpecifyApiOperation.test-data";
import {shouldUseApiOperationDecorator} from "./apiMethodsShouldSpecifyApiOperation";

// should probably be split up into multiple tests
describe("apiMethodsShouldSpecifyApiOperation", () => {
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
                fakeContext
            );

            const shouldUseOptional = shouldUseApiOperationDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.MethodDefinition
            );
            expect(shouldUseOptional).toEqual(testCase.shouldUseDecorator);
        }
    );
});
