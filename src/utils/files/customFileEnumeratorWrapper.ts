import {glob} from "glob";
import path from "path";
import IsFilteredPath from "./isFilteredPath.js";

interface FilePath {
    ignored: boolean;
    filename: string;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileEnumerator {
    static enumerateFiles({
        sourceGlobs,
        extensions,
        filterFromPaths,
    }: {
        sourceGlobs: string[];
        extensions: string[];
        filterFromPaths: string[];
    }): FilePath[] {
        // Create glob pattern that includes extensions
        const patterns = sourceGlobs.flatMap((filePath) => {
            if (path.extname(filePath)) {
                return filePath;
            }
            return extensions.map(
                (extension: string) => `${filePath}/**/*${extension}`
            );
        });
        console.log("globPatterns", patterns);
        // Find all files matching the patterns
        const files = glob.sync(patterns, {
            ignore: ["**/node_modules/**"],
            nodir: true,
            absolute: true,
        });
        console.log("files", files);
        // Map to the expected format and filter
        return files
            .map(
                (filePath): FilePath => ({
                    ignored: false, // You can implement custom ignore logic if needed
                    filename: filePath,
                })
            )
            .filter((file) => {
                const isFiltered = IsFilteredPath.test(
                    file.filename,
                    filterFromPaths
                );
                console.log("isFiltered", file.filename, isFiltered);
                return !isFiltered;
            });
    }
}

export default FileEnumerator;
