import {
    EslintFile,
    FileEnumerator,
    FilePath,
    // eslint-disable-next-line import/no-unresolved
} from "eslint/use-at-your-own-risk";
import IsFilteredPath from "./isFilteredPath";

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
                return !IsFilteredPath.test(file.filename, filterFromPaths);
            });
    };
}

export default FileEnumeratorWrapper;
