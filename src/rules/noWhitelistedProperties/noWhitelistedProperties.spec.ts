import {RuleTester} from "@typescript-eslint/experimental-utils/dist/eslint-utils";
import rule from "./noWhitelistedProperties";

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
});

ruleTester.run("no-whitelisted-properties", rule, {
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
  @IsString()
  b: string
  
  @Allow()
  b: string
}
    `,
        },
    ],
    invalid: [
        {
            code: `
class A {
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
