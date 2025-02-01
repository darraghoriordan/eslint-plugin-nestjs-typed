import path from "path";

export function getFixturesRootDirectory(): string {
    return path.join(__dirname, "..", "fixtures");
}
