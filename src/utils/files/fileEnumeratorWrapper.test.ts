import IsFilteredPath from "./isFilteredPath";

describe("FileEnumerationWrapper", () => {
    test.each([
        ["/blah/src/file.test.ts", true],
        ["/blah/src/file.d.ts", false],
        ["/blah/src/file.ts", false],
        ["/blah/src/node_modules/file.test.ts", true],
        [undefined, false],
    ])(
        "%s is filtered path",
        (testPath: string | undefined, expected: boolean) => {
            const isFiltered = IsFilteredPath.test(testPath, [
                "node_modules",
                // prettier-ignore
                // eslint-disable-next-line no-useless-escape
                "\.test\.",
            ]);
            expect(isFiltered).toEqual(expected);
        }
    );

    it("handles undefined filters", () => {
        const isFiltered = IsFilteredPath.test("path/path/blah.ts", undefined);
        expect(isFiltered).toEqual(false);
    });
});
