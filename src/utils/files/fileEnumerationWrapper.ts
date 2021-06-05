import {
    EslintFile,
    FileEnumerator,
    FilePath,
} from "eslint/lib/cli-engine/file-enumerator";

// eslint-disable-next-line unicorn/no-static-only-class
class FileEnumeratorWrapper {
    static enumerateFiles = (
        sourceGlobs: string[],
        extensions: string[],
        filterFromPaths: string[]
    ): Array<FilePath> => {
        const fileEnumerator = new FileEnumerator({
            extensions,
        });

        const iterator = fileEnumerator.iterateFiles(sourceGlobs);

        return FileEnumeratorWrapper.mapEnumeratedFiles(
            iterator,
            filterFromPaths
        );
    };

    static isFilteredPath = (
        path: string | undefined,
        filteredStrings: string[] | undefined
    ): boolean => {
        if (!path) {
            return false;
        }
        const hasFoundFilter = filteredStrings?.some((setting: string) => {
            return new RegExp(`(${setting})`).test(path);
        });
        return hasFoundFilter || false;
    };

    static mapEnumeratedFiles = (
        paths: Array<EslintFile>,
        filterFromPaths: string[]
    ): Array<FilePath> => {
        return [...paths]
            .map(
                ({
                    filePath,
                    ignored,
                }: {
                    filePath: string;
                    ignored: boolean;
                }) => ({
                    ignored,
                    filename: filePath,
                })
            )
            .filter((file) => {
                return !FileEnumeratorWrapper.isFilteredPath(
                    file.filename,
                    filterFromPaths
                );
            });
    };
}

export default FileEnumeratorWrapper;
