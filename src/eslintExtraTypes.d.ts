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
import "typescript";

// following is copied from ts-eslint plugin to check for array type
declare module "typescript" {
    interface TypeChecker {
        // internal TS APIs

        /**
         * @returns `true` if the given type is an array type:
         * - `Array<foo>`
         * - `ReadonlyArray<foo>`
         * - `foo[]`
         * - `readonly foo[]`
         */
        isArrayType(type: Type): type is TypeReference;
        /**
         * @returns `true` if the given type is a tuple type:
         * - `[foo]`
         * - `readonly [foo]`
         */
        isTupleType(type: Type): type is TupleTypeReference;
        /**
         * Return the type of the given property in the given type, or undefined if no such property exists
         */
        getTypeOfPropertyOfType(
            type: Type,
            propertyName: string
        ): Type | undefined;
    }

    interface Type {
        /**
         * If the type is `any`, and this is set to "error", then TS was unable to resolve the type
         */
        intrinsicName?: string;
    }
}
