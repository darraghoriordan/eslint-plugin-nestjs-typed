/* eslint-disable @typescript-eslint/no-explicit-any */
//import {TSESTree} from "@typescript-eslint/experimental-utils";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.test-date";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {hasMismatchedInjected} from "./ProviderInjectedShouldMatchFactory";
import {testCases} from "./ProviderInjectedShouldMatchFactory.test-data";

describe("ProviderInjectedShouldMatchFactory", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            hasMismatch: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                fakeContext
            );
            const hasMismatch = hasMismatchedInjected(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as any).declaration.declarations[0]
            );
            expect(hasMismatch).toEqual(testCase.hasMismatch);
        }
    );
});
