declare module "eslint/use-at-your-own-risk" {
    export class FileEnumerator {
        constructor(options: {
            cwd?: string;
            extensions?: string[];
            globInputPaths?: boolean;
            errorOnUnmatchedPattern?: boolean;
            ignore?: boolean;
        });
        public iterateFiles: (source: string | string[]) => Array<EslintFile>;
    }

    export type EslintFile = {
        filePath: string;
        ignored: boolean;
    };
    export type FilePath = {
        ignored: boolean;
        filename: string;
    };
}

type AstParsed = Program & {
    range?: [number, number] | undefined;
    tokens?: Token[] | undefined;
    comments?: Comment[] | undefined;
};

declare module "eslint-module-utils/unambiguous" {
    export function isModule(ast: AstParsed): boolean;
}
