import {RuleTester} from "@typescript-eslint/experimental-utils/dist/eslint-utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./validateNonPrimitiveNeedsDecorators";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("validated-non-primitive-property-needs-type-decorator", rule, {
    valid: [
        {
            // no validation decorator
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @IsDefined()
                @Type(()=> Person)
                members!: Person;
            }
    `,
        },
        {
            // no validation decorator
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                members!: (Person|Date);
            }
    `,
        },
        {
            // has the type decorator already
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                @IsArray()
                @Type(()=>Boolean)
                members!: boolean[]
            }
    `,
        },
        {
            // is a primitive type
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                @IsBoolean()
                members!: boolean
            }
    `,
        },
    ],
    invalid: [
        {
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                @IsArray()
                members!: (Person|Date)[];
            }
    `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                },
            ],
        },
        {
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                @IsDate()
                members!: Date;
            }
    `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                },
            ],
        },
        {
            code: `
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                @IsDefined()
                members!: CustomClass;
            }
    `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                },
            ],
        },
    ],
});
