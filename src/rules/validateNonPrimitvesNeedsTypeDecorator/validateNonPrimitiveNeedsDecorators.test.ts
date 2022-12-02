import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./validateNonPrimitiveNeedsDecorators";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
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
            // is a primitive type date with custom transform - https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/issues/32
            options: [{additionalTypeDecorators: ["TransformDate"]}],
            code: `
            import { IsOptional, IsDate } from 'class-validator';
            
            class ExampleDto {
                @ApiPropertyOptional(
                    {
                        description: "Filter by date",
                        required: false,
                        writeOnly: true,
                    }
                )
                @Expose()
                @IsOptional()
                @TransformDate()
                @IsDate()
               exampleProperty!: Date;
              }
    `,
        },
        {
            // is a primitive type array - doesn't need type (from https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/issues/22)
            code: `
            class ExampleDto {
                @ApiProperty({
                  isArray: true,
                })
                @Allow()
               exampleProperty!: string[];
              }
    `,
        },
        {
            // is an OPTIONAL primitive type array - doesn't need type (from https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/issues/22)
            code: `
            class ExampleDto {
                @ApiPropertyOptional({
                  isArray: true,
                })
                @Allow()
               exampleProperty?: string[];
              }
    `,
        },
        {
            // is an OPTIONAL primitive type array - doesn't need type (from https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/issues/22)
            code: `
            enum Bar {}

            export class Foo {
                @ApiProperty()
                  @IsString()
                  myProp!: string;

                @ApiProperty({
                  enum: Bar,
                  enumName: "Bar",
                })
                @IsOptional()
                baz?: Bar | null;
              }
    `,
        },
        {
            code: `
enum Baz {}

class Foo {
  @ApiPropertyOptional({
    enum: Baz,
    enumName: "Baz",
    required: false,
    isArray: true,
  })
  @IsOptional()
  bar?: Baz[];
}
`,
        },
        {
            // scenario from https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/issues/21
            code: `
            class ExampleDto {
                @ApiProperty({ isArray: true })
                @Allow()
                @Type(() => Array)
                events!: Array<string>;
              }
    `,
        },
        {
            // no validation decorator
            code: `
            import { IsDefined } from 'class-validator';
            
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @IsDefined()
                @Type(()=> Person)
                members!: Person;
            }
    `,
        },
        {
            // sequelize-typescript validator with class-validator name conflict
            code: `
            import { IsInt } from 'sequelize-typescript'
            
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @IsDefined()
                @IsInt
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
                import { IsArray } from 'class-validator';
                
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
                import { IsBoolean } from 'class-validator';
                
                export class CreateOrganisationDto {
                    @ApiProperty({ type: Person, isArray: true })
                    @ValidateNested({each:true})
                    @IsBoolean()
                    members!: boolean
                }
        `,
        },
        {
            // is not a primitive type so skip
            code: `
                import { Allow } from 'class-validator';
                
                enum Foo {
                    BAR
                 }

                export class CreateOrganisationDto {
                    @ApiProperty({ enum: Foo, enumName: 'Foo' })
                    @Allow()
                    members!: Foo
                }
        `,
        },
        {
            // is an array - should have type and has it so pass!
            code: `
            import { ValidateNested } from 'class-validator';
            
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                @Type(()=> Foo)
                members!: Foo[];
            }
    `,
        },
        {
            // has @IsObject decorator, does not need a Type
            code: `
            import { IsObject } from 'class-validator';
            class ExampleDto {
                @ApiProperty({
                  isArray: true,
                })
                @Allow()
                @IsObject()
               nullExampleProperty!: object
              }
    `,
        },
        {
            // is a union between primitive array and null - doesn't need type
            code: `
            import { IsString } from 'class-validator';

            class ExampleDto {
                @ApiProperty({
                  isArray: true,
                })
                @Allow()
                @IsString({each: true})
               nullExampleProperty!: string[] | null;
              }
    `,
        },
        {
            // Checks for for custom validator decorators
            options: [
                {
                    additionalTypeDecorators: [],
                    additionalCustomValidatorDecorators: ["IsDateRange"],
                },
            ],
            code: `
            
            class ExampleDto {
                @ApiPropertyOptional(
                    {
                        description: "Filter by date",
                        required: false,
                        writeOnly: true,
                    }
                )
                @Expose()
                @IsDateRange()
                @Type(() => Date)
                @TransformDate()
                exampleProperty!: [Date, Date];
              }
    `,
        },
    ],
    invalid: [
        {
            // is an array - should have type
            code: `
            import { ValidateNested } from 'class-validator';
            
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members!: Foo[];
            }
    `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                    suggestions: [
                        {
                            messageId: "autofixWithTypeDecorator",
                            data: {typeIdentifier: "Foo"},
                            output: `
            import { ValidateNested } from 'class-validator';
            
            export class CreateOrganisationDto {
                @Type(() => Foo)@ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members!: Foo[];
            }
    `,
                        },
                    ],
                },
            ],
        },
        {
            // is an OPTIONAL array - should have type
            code: `
            import { ValidateNested } from 'class-validator';
            
            export class Foo {}
            
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members?: Foo[];
            }
    `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                    suggestions: [
                        {
                            messageId: "autofixWithTypeDecorator",
                            data: {typeIdentifier: "Foo"},
                            output: `
            import { ValidateNested } from 'class-validator';
            
            export class Foo {}
            
            export class CreateOrganisationDto {
                @Type(() => Foo)@ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members?: Foo[];
            }
    `,
                        },
                    ],
                },
            ],
        },
        {
            // is an Array<> declared array - should have type
            code: `
            import { ValidateNested } from 'class-validator';
            
            export class Foo {}
            
            export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members?: Array<Foo>;
            }
    `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                    suggestions: [
                        {
                            messageId: "autofixWithTypeDecorator",
                            data: {typeIdentifier: "Foo"},
                            output: `
            import { ValidateNested } from 'class-validator';
            
            export class Foo {}
            
            export class CreateOrganisationDto {
                @Type(() => Foo)@ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members?: Array<Foo>;
            }
    `,
                        },
                    ],
                },
            ],
        },
        {
            // is an array with union - should have type
            code: `
                import { ValidateNested, IsArray } from 'class-validator';
                
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
                    suggestions: [],
                },
            ],
        },
        {
            // is an array with union - should have type
            code: `
                import { ValidateNested, IsArray } from 'class-validator';
                
                export class CreateOrganisationDto {
                    @ApiProperty({ type: Person, isArray: true })
                    @ValidateNested({each:true})
                    @IsArray()
                    members!: (Person&Date)[];
                }
        `,
            errors: [
                {
                    messageId: "shouldUseTypeDecorator",
                    suggestions: [],
                },
            ],
        },
        {
            // is not a primitive type
            code: `
                import { ValidateNested, IsDate } from 'class-validator';
                
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
                    suggestions: [
                        {
                            messageId: "autofixWithTypeDecorator",
                            data: {typeIdentifier: "Date"},
                            output: `
                import { ValidateNested, IsDate } from 'class-validator';
                
                export class CreateOrganisationDto {
                    @Type(() => Date)@ApiProperty({ type: Person, isArray: true })
                    @ValidateNested({each:true})
                    @IsDate()
                    members!: Date;
                }
        `,
                        },
                    ],
                },
            ],
        },
        {
            // is a custom class
            code: `
                import { ValidateNested, IsDefined } from 'class-validator';
                
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
                    suggestions: [
                        {
                            messageId: "autofixWithTypeDecorator",
                            data: {typeIdentifier: "CustomClass"},
                            output: `
                import { ValidateNested, IsDefined } from 'class-validator';
                
                export class CreateOrganisationDto {
                    @Type(() => CustomClass)@ApiProperty({ type: Person, isArray: true })
                    @ValidateNested({each:true})
                    @IsDefined()
                    members!: CustomClass;
                }
        `,
                        },
                    ],
                },
            ],
        },
    ],
});
