import {RuleTester} from "@typescript-eslint/utils/dist/eslint-utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./allDefinedPropertyMustBeDecored";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("all-defined-property-must-be-decored", rule, {
    valid: [
        {
            code: `
class A {
  @IsDefined()
  b: string
}
    `,
        },
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
  b: number
  
  @IsDefined()
  c: string
}
    `,
        },
        {
            code: `
class A {
  @IsInt()
  b: number
}
    `,
        },
        {
            code: `
class A {
  @IsInt()
  b: number
  @IsString()
  c: string
}
    `,
        },
        {
            code: `
class A {
  @IsString()
  c: string
}
    `,
        },
    ],
    invalid: [
        {
            code: `
class A {
  @A
  b: string
}
        `,
            errors: [
                {
                    messageId: "missing-is-defined-decorator",
                },
            ],
        },
        {
            code: `
class A {
  @A()
  b: string
}
        `,
            errors: [
                {
                    messageId: "missing-is-defined-decorator",
                },
            ],
        },
        {
            code: `
class A {
  b: string
}
    `,
            errors: [
                {
                    messageId: "missing-is-defined-decorator",
                },
            ],
        },
        {
            code: `
class A {
  @IsOptional()
  b: string
}
    `,
            errors: [
                {
                    messageId: "missing-is-defined-decorator",
                },
            ],
        },
    ],
});
