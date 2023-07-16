import {FileEnumerator, FilePath} from "eslint/use-at-your-own-risk";
import IsFilteredPath from "./isFilteredPath";

// eslint-disable-next-line unicorn/no-static-only-class
class FileEnumeratorWrapper {
    static enumerateFiles = (
        sourceGlobs: string[],
        extensions: string[],
        filterFromPaths: string[]
    ): FilePath[] => {
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
        paths: IterableIterator<{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            config: any;
            filePath: string;
            ignored: boolean;
        }>,
        filterFromPaths: string[]
    ): FilePath[] => {
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
