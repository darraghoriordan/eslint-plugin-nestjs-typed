import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./apiPropertyShouldHaveApiExtraModels.js";

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

ruleTester.run("api-property-should-have-api-extra-models", rule, {
    valid: [
        {
            // No decorator at all
            code: `class TestClass {
                pet: Cat | Dog;
            }`,
        },
        {
            // ApiProperty without oneOf/allOf/anyOf
            code: `class TestClass {
                @ApiProperty()
                name: string;
            }`,
        },
        {
            // ApiProperty with type only
            code: `class TestClass {
                @ApiProperty({ type: String })
                name: string;
            }`,
        },
        {
            // oneOf without getSchemaPath (e.g., primitive types)
            code: `class TestClass {
                @ApiProperty({
                    oneOf: [
                        { type: 'string' },
                        { type: 'number' },
                    ],
                })
                value: string | number;
            }`,
        },
        {
            // Using spread operator (should be ignored)
            code: `class TestClass {
                @ApiProperty({ ...someConfig })
                value: any;
            }`,
        },
        {
            // with annotation extraModels
            code: `
            @ApiExtraModels(Cat, Dog)
            class TestClass {
                @ApiProperty({
                    oneOf: [
                        { $ref: getSchemaPath(Cat) },
                        { $ref: getSchemaPath(Dog) },
                    ],
                })
                pet: Cat | Dog;
            }`,
        },
    ],
    invalid: [
        {
            // oneOf with single model
            code: `class TestClass {
                @ApiProperty({
                    oneOf: [
                        { $ref: getSchemaPath(Cat) },
                    ],
                })
                pet: Cat;
            }`,
            errors: [
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Cat",
                        schemaType: "oneOf",
                    },
                },
            ],
        },
        {
            // oneOf with multiple models
            code: `class TestClass {
                @ApiProperty({
                    oneOf: [
                        { $ref: getSchemaPath(Cat) },
                        { $ref: getSchemaPath(Dog) },
                    ],
                })
                pet: Cat | Dog;
            }`,
            errors: [
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Cat",
                        schemaType: "oneOf",
                    },
                },
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Dog",
                        schemaType: "oneOf",
                    },
                },
            ],
        },
        {
            // allOf with models
            code: `class TestClass {
                @ApiProperty({
                    allOf: [
                        { $ref: getSchemaPath(BaseModel) },
                        { $ref: getSchemaPath(ExtendedModel) },
                    ],
                })
                model: BaseModel & ExtendedModel;
            }`,
            errors: [
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "BaseModel",
                        schemaType: "allOf",
                    },
                },
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "ExtendedModel",
                        schemaType: "allOf",
                    },
                },
            ],
        },
        {
            // anyOf with models
            code: `class TestClass {
                @ApiProperty({
                    anyOf: [
                        { $ref: getSchemaPath(Cat) },
                        { $ref: getSchemaPath(Dog) },
                    ],
                })
                pet: Cat | Dog;
            }`,
            errors: [
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Cat",
                        schemaType: "anyOf",
                    },
                },
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Dog",
                        schemaType: "anyOf",
                    },
                },
            ],
        },
        {
            // ApiPropertyOptional with oneOf
            code: `class TestClass {
                @ApiPropertyOptional({
                    oneOf: [
                        { $ref: getSchemaPath(Cat) },
                        { $ref: getSchemaPath(Dog) },
                    ],
                })
                pet?: Cat | Dog;
            }`,
            errors: [
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Cat",
                        schemaType: "oneOf",
                    },
                },
                {
                    messageId: "shouldUseApiExtraModels",
                    data: {
                        modelName: "Dog",
                        schemaType: "oneOf",
                    },
                },
            ],
        },
    ],
});
