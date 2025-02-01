import type {ClassicConfig} from "@typescript-eslint/utils/ts-eslint";

export = {
    parser: "@typescript-eslint/parser",
    parserOptions: {sourceType: "module"},
    plugins: ["@darraghor/nestjs-typed"],
} satisfies ClassicConfig.Config;
