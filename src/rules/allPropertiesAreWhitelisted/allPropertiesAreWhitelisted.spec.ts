import {ESLintUtils} from "@typescript-eslint/utils";
import rule from "./allPropertiesAreWhitelisted";

const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
});

ruleTester.run("all-properties-are-whitelisted", rule, {
    valid: [
        {
            code: `
import { A } from 'class-validator';

class A {
  @A
  b: string
}
        `,
        },
        {
            code: `
import { A } from 'class-validator';

class A {
  @A()
  b: string
}
        `,
        },
        {
            code: `
import { A } from 'class-validator';

class A {
  b: string
}
    `,
        },
        {
            code: `
import { IsString, Allow } from 'class-validator';

class A {
  @IsString()
  b: string
  
  @Allow()
  b: string
}
    `,
        },
        {
            code: `
import { IsInt } from 'sequelize-typescript';

class A {
  @IsInt()
  b: string
  
  b: string
}
    `,
        },
    ],
    invalid: [
        {
            code: `
import { Allow } from 'class-validator';

class MyClass {
  @Allow()
  b: string

  b: string
}
    `,
            errors: [
                {
                    messageId: "missing-property-decorator",
                },
            ],
        },
    ],
});
