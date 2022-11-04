import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./shouldSpecifyForbidUnknownValuesRule";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("validation-pipe-should-use-forbid-unknown", rule, {
    valid: [
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            } as ValidationPipeOptions;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ValidationPipe({
                transform: true,
                skipMissingProperties: false,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            });   
    `,
        },
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
            } as ThisIsNotAValidationPipeOptionsClass;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ValidationPipe({
                transform: true,
                skipMissingProperties: false,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            });   
    `,
        },
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            } as ValidationPipeOptions;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ThisIsNotAValidationPipeClass({
                transform: true,
                skipMissingProperties: false,
                whitelist: true,
                forbidNonWhitelisted: true
            });   
    `,
        },
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            } as ValidationPipeOptions;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ValidationPipe();   
    `,
        },
    ],
    invalid: [
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
            } as ValidationPipeOptions;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ValidationPipe({
                transform: true,
                skipMissingProperties: false,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            });   
    `,
            errors: [
                {
                    messageId: "shouldSpecifyForbidUnknownValues",
                },
            ],
        },
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            } as ValidationPipeOptions;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ValidationPipe({
                transform: true,
                skipMissingProperties: false,
                whitelist: true,
                forbidNonWhitelisted: true
            });   
    `,
            errors: [
                {
                    messageId: "shouldSpecifyForbidUnknownValues",
                },
            ],
        },
        {
            code: `
            const options = {
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            } as ValidationPipeOptions;
    
            const validationPipeA = new ValidationPipe(options);
    
            const validationPipeB = new ValidationPipe({});   
    `,
            errors: [
                {
                    messageId: "shouldSpecifyForbidUnknownValues",
                },
            ],
        },
    ],
});
