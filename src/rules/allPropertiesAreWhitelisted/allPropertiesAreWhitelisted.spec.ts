import {RuleTester} from "@typescript-eslint/rule-tester";
import rule from "./allPropertiesAreWhitelisted.js";

const ruleTester = new RuleTester();

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
        {
            name: "should allow custom decorator with additionalDecorators option",
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
        {
            name: "should allow multiple custom decorators",
            code: `
import { IsString } from 'class-validator';

function CustomValidatorA() {
  return function(target: any, propertyKey: string) {};
}

function CustomValidatorB() {
  return function(target: any, propertyKey: string) {};
}

class MyDto {
  @CustomValidatorA()
  fieldA: string;

  @CustomValidatorB()
  fieldB: string;

  @IsString()
  fieldC: string;
}
    `,
            options: [
                {
                    additionalDecorators: [
                        "CustomValidatorA",
                        "CustomValidatorB",
                    ],
                },
            ],
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
                    messageId: "missing-property-decorator",
                },
            ],
        },
    ],
});
