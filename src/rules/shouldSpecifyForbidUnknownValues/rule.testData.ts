/* eslint-disable unicorn/filename-case */
export const testCases = [
    {
        moduleCode: `
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
        isNewExpressionTriggered: false,
        isVariableExpressionTriggered: false,
        message: "property is present in both scenarios",
    },
    {
        moduleCode: `
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
        isNewExpressionTriggered: false,
        isVariableExpressionTriggered: true,
        message: "property is missing in options object variable",
    },
    {
        moduleCode: `
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
        isNewExpressionTriggered: false,
        isVariableExpressionTriggered: false,
        message: "not a validation options class",
    },
    {
        moduleCode: `
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
        isNewExpressionTriggered: true,
        isVariableExpressionTriggered: false,
        message: "property is missing in parameter declaration",
    },
    {
        moduleCode: `
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
        isNewExpressionTriggered: false,
        isVariableExpressionTriggered: false,
        message: "not the right class to trigger the rule",
    },
    {
        moduleCode: `
                const options = {
                    forbidNonWhitelisted: true,
                    forbidUnknownValues: true,
                } as ValidationPipeOptions;
        
                const validationPipeA = new ValidationPipe(options);
        
                const validationPipeB = new ValidationPipe({});   
        `,
        isNewExpressionTriggered: true,
        isVariableExpressionTriggered: false,
        message: "empty options object should trigger",
    },
    {
        moduleCode: `
                const options = {
                    forbidNonWhitelisted: true,
                    forbidUnknownValues: true,
                } as ValidationPipeOptions;
        
                const validationPipeA = new ValidationPipe(options);
        
                const validationPipeB = new ValidationPipe();   
        `,
        isNewExpressionTriggered: false,
        isVariableExpressionTriggered: false,
        message: "empty constructor should not trigger the rule",
    },
];
