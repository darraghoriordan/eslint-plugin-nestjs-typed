import "typescript";
import {TSESTree} from "@typescript-eslint/typescript-estree";

declare module "eslint/use-at-your-own-risk" {
    export class FileEnumerator {
        constructor(options: {
            cwd?: string;
            extensions?: string[];
            globInputPaths?: boolean;
            errorOnUnmatchedPattern?: boolean;
            ignore?: boolean;
        });
        public iterateFiles: (source: string | string[]) => EslintFile[];
    }

    export interface EslintFile {
        filePath: string;
        ignored: boolean;
    }
    export interface FilePath {
        ignored: boolean;
        filename: string;
    }
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type AstParsed = TSESTree.Program & {
    range?: [number, number] | undefined;
    tokens?: Token[] | undefined;
    comments?: Comment[] | undefined;
};

declare module "eslint-module-utils/unambiguous" {
    export function isModule(ast: AstParsed): boolean;
}
