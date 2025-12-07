import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./allPropertiesHaveExplicitDefined.js";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: tsRootDirectory,
            project: "./tsconfig.json",
        },
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
            import { IsDefined } from 'class-validator';
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
            import { IsInt, IsDefined } from 'class-validator';
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
            import { IsInt } from 'class-validator';
class A {
  @IsInt()
  b: number
}
    `,
        },
        {
            code: `
            import { IsInt, IsString } from 'class-validator';
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
            import { IsInt, IsOptional,IsString } from 'class-validator';
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
            import { IsInt, IsOptional,IsString } from 'class-validator';
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

        {
            code: `
import { IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
class A {
  @IsInt()
  @IsOptional()
  b?: number

  @ValidateIf((o) => !o.b)
  @IsString()
  c?: string
}
    `,
        },
        {
            code: `
import { IsDefined, IsString, ValidateIf } from 'class-validator';
class A {
  @ValidateIf((o) => !o.id)
  @IsDefined()
  @IsString()
  key?: string
}
    `,
        },
        {
            code: `
import { IsDefined, ValidateIf } from 'class-validator';
class A {
  @ValidateIf((o) => !o.id)
  @IsDefined()
  key?: string
}
    `,
        },
        {
            name: "should allow custom decorator with additionalDecorators option",
            code: `
import { IsDefined } from 'class-validator';

function IsValidLoginIdentifier() {
  return function(target: any, propertyKey: string) {};
}

class LoginDto {
  @IsValidLoginIdentifier()
  identifier: string;

  @IsDefined()
  password: string;
}
    `,
            options: [{additionalDecorators: ["IsValidLoginIdentifier"]}],
        },
        {
            name: "should allow custom decorator without @IsDefined when it's a type checking decorator",
            code: `
import { IsString } from 'class-validator';

function IsValidLoginIdentifier() {
  return function(target: any, propertyKey: string) {};
}

class LoginDto {
  @IsValidLoginIdentifier()
  identifier: string;

  @IsString()
  password: string;
}
    `,
            options: [{additionalDecorators: ["IsValidLoginIdentifier"]}],
        },
    ],
    invalid: [
        {
            code: `
            import { IsDefined } from 'class-validator';
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
            import { IsOptional } from 'class-validator';
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
            import { IsOptional } from 'class-validator';
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
            import { IsDefined } from 'class-validator';
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
            import { IsInt} from 'class-validator';
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
            import { IsOptional, IsDefined } from 'class-validator';
class A {
  @IsDefined()
  @IsOptional()
  b?: string
}
    `,
            errors: [
                {
                    messageId:
                        "conflicting-defined-decorators-defined-optional",
                },
            ],
        },
        {
            code: `
            import { ValidateIf, IsOptional } from 'class-validator';
class A {
  @IsOptional()
  @ValidateIf()
  b?: string
}
    `,
            errors: [
                {
                    messageId:
                        "conflicting-defined-decorators-optional-validate-if",
                },
            ],
        },
        {
            code: `
            import { ValidateIf, IsOptional, IsDefined } from 'class-validator';
class A {
  @IsDefined()
  @IsOptional()
  @ValidateIf()
  b?: string
}
    `,
            errors: [
                {
                    messageId: "conflicting-defined-decorators-all",
                },
            ],
        },
        {
            name: "should report error when custom decorator is not in additionalDecorators",
            code: `
import { IsString } from 'class-validator';

function IsValidLoginIdentifier() {
  return function(target: any, propertyKey: string) {};
}

class LoginDto {
  @IsValidLoginIdentifier()
  identifier: string;

  @IsString()
  password: string;
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
