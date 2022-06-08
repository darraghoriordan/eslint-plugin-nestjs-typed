import {RuleTester} from "@typescript-eslint/utils/dist/eslint-utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./allOptionnalPropertyMustBeDecored";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("all-properties-have-explicit-defined", rule, {
    valid: [
        {
            code: `
class A {
  @IsOptional()
  b?: number
}
    `,
        },
        {
            code: `
class A {
  @IsInt()
  @IsOptional()
  b?: number
}
    `,
        },
    ],
    invalid: [
        {
            code: `
class A {
  c?: string
}
    `,
            errors: [
                {
                    messageId: "missing-is-optional-decorator",
                },
            ],
        },
        {
            code: `
class A {
  @IsDefined()
  b?: string
}
    `,
            errors: [
                {
                    messageId: "missing-is-optional-decorator",
                },
            ],
        },
        {
            code: `
class A {
  @IsInt()
  b?: string
}
    `,
            errors: [
                {
                    messageId: "missing-is-optional-decorator",
                },
            ],
        },
    ],
});
