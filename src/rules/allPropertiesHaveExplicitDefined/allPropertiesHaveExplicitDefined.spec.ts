import {RuleTester} from "@typescript-eslint/utils/dist/eslint-utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./allPropertiesHaveExplicitDefined";

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
  @A
  b: string
}
        `,
        },
        {
            code: `
class A {
  @A()
  b: string
}
        `,
        },
        {
            code: `
class A {
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
  @IsInt()
  @IsOptional()
  b?: number

  @IsString()
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
  b: string

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
  @IsOptional()
  b?: string

  c: string
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
                    messageId: "conflicting-defined-decorators",
                },
            ],
        },
    ],
});
