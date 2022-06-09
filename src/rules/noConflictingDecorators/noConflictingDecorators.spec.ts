import {RuleTester} from "@typescript-eslint/utils/dist/eslint-utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./noConflictingDecorators";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("no-conflicting-decorators", rule, {
    valid: [
        {
            code: `
class A {
@IsDefined()
b: string

@IsDefined()
c: string
}
`,
        },
        {
            code: `
class A {
@IsInt()
@IsDefined()
c: string
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
        {
            code: `
class A {
@IsInt()
@IsDefined()
b: number
@IsString()
@IsOptional()
c?: string
}
`,
        },
    ],
    invalid: [
        {
            code: `
class A {
@IsDefined()
@IsOptional()
b?: string
}
  `,
            errors: [
                {
                    messageId: "conflicting-decorators",
                },
            ],
        },
    ],
});
