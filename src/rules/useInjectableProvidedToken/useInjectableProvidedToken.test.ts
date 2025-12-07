import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./useInjectableProvidedToken.js";

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

ruleTester.run("use-injectable-provided-token", rule, {
    valid: [
        {
            // Regular service injection is fine
            code: `
                class TestService {
                    constructor(@Inject(MyService) private myService: MyService) {}
                }
            `,
        },
        {
            // app.get() with regular service is fine
            code: `
                const myService = app.get(MyService);
            `,
        },
        {
            // Using APP_* tokens in module providers is fine (not checked by this rule)
            code: `
                @Module({
                    providers: [
                        {
                            provide: APP_GUARD,
                            useClass: AuthGuard,
                        },
                    ],
                })
                class AppModule {}
            `,
        },
        {
            // app.get() with string token is fine (we only check identifier tokens)
            code: `
                const something = app.get("APP_GUARD");
            `,
        },
        {
            // @Inject() with string token is fine
            code: `
                class TestService {
                    constructor(@Inject("CUSTOM_TOKEN") private service: any) {}
                }
            `,
        },
        {
            // Other decorators with APP_* tokens are not checked
            code: `
                @CustomDecorator(APP_GUARD)
                class TestClass {}
            `,
        },
    ],
    invalid: [
        {
            // app.get(APP_GUARD) should error
            code: `
                const guard = app.get(APP_GUARD);
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_GUARD",
                        method: "app.get()",
                    },
                },
            ],
        },
        {
            // app.get(APP_PIPE) should error
            code: `
                const pipe = app.get(APP_PIPE);
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_PIPE",
                        method: "app.get()",
                    },
                },
            ],
        },
        {
            // app.get(APP_FILTER) should error
            code: `
                const filter = app.get(APP_FILTER);
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_FILTER",
                        method: "app.get()",
                    },
                },
            ],
        },
        {
            // app.get(APP_INTERCEPTOR) should error
            code: `
                const interceptor = app.get(APP_INTERCEPTOR);
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_INTERCEPTOR",
                        method: "app.get()",
                    },
                },
            ],
        },
        {
            // @Inject(APP_GUARD) should error
            code: `
                class TestService {
                    constructor(@Inject(APP_GUARD) private guard: any) {}
                }
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_GUARD",
                        method: "@Inject()",
                    },
                },
            ],
        },
        {
            // @Inject(APP_PIPE) should error
            code: `
                class TestService {
                    constructor(@Inject(APP_PIPE) private pipe: any) {}
                }
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_PIPE",
                        method: "@Inject()",
                    },
                },
            ],
        },
        {
            // @Inject(APP_FILTER) should error
            code: `
                class TestService {
                    constructor(@Inject(APP_FILTER) private filter: any) {}
                }
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_FILTER",
                        method: "@Inject()",
                    },
                },
            ],
        },
        {
            // @Inject(APP_INTERCEPTOR) should error
            code: `
                class TestService {
                    constructor(@Inject(APP_INTERCEPTOR) private interceptor: any) {}
                }
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_INTERCEPTOR",
                        method: "@Inject()",
                    },
                },
            ],
        },
        {
            // Multiple violations in one file
            code: `
                const guard = app.get(APP_GUARD);
                
                class TestService {
                    constructor(@Inject(APP_PIPE) private pipe: any) {}
                }
            `,
            errors: [
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_GUARD",
                        method: "app.get()",
                    },
                },
                {
                    messageId: "useInjectableProvidedToken",
                    data: {
                        tokenName: "APP_PIPE",
                        method: "@Inject()",
                    },
                },
            ],
        },
    ],
});
