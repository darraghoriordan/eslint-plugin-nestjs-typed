import {glob} from "glob";
import path from "path";
import IsFilteredPath from "./isFilteredPath";

interface FilePath {
    ignored: boolean;
    filename: string;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileEnumerator {
    static enumerateFiles(
        sourceGlobs: string[],
        extensions: string[],
        filterFromPaths: string[]
    ): FilePath[] {
        // Create glob pattern that includes extensions
        const patterns = sourceGlobs.flatMap((pattern) => {
            if (path.extname(pattern)) {
                return pattern;
            }
            return extensions.map(
                (extension: string) => `${pattern}/**/*${extension}`
            );
        });

        // Find all files matching the patterns
        const files = glob.sync(patterns, {
            ignore: ["**/node_modules/**"],
            nodir: true,
        });

        // Map to the expected format and filter
        return files
            .map(
                (filePath): FilePath => ({
                    ignored: false, // You can implement custom ignore logic if needed
                    filename: filePath,
                })
            )
            .filter(
                (file) => !IsFilteredPath.test(file.filename, filterFromPaths)
            );
    }
}

export default FileEnumerator;
