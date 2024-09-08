import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./sortModuleMetadataArrays";

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

ruleTester.run("sortModuleMetadataArrays", rule, {
    valid: [
        {
            code: `@Module({
                imports: [
                    AuthzModule,
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
        },
    ],
    invalid: [
        {
            code: `@Module({
                imports: [
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                    AuthzModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
            output: [
                `@Module({
                imports: [
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    AuthzModule,
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
                `@Module({
                imports: [
                    CoreModule,
                    DatabaseModule,
                    AuthzModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
                `@Module({
                imports: [
                    CoreModule,
                    AuthzModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
                `@Module({
                imports: [
                    AuthzModule,
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
            ],
            errors: [
                {
                    messageId: "moduleMetadataArraysAreSorted",
                },
            ],
        },
        {
            code: `@Module({
                imports: [
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    AuthzModule,
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
            output: [
                `@Module({
                imports: [
                    CoreModule,
                    DatabaseModule,
                    AuthzModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
                `@Module({
                imports: [
                    CoreModule,
                    AuthzModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
                `@Module({
                imports: [
                    AuthzModule,
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
            ],
            errors: [
                {
                    messageId: "moduleMetadataArraysAreSorted",
                },
            ],
        },
        {
            code: `@Module({
                imports: [
                    AuthzModule,
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    BController,
                    AController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
            output: `@Module({
                imports: [
                    AuthzModule,
                    CoreModule,
                    DatabaseModule,
                    OpenTelemetryModule.forRoot({
                        metrics: {
                            hostMetrics: true,
                            apiMetrics: {
                                enable: true,
                            },
                        },
                    }),
                    UserInternalModule,
                ],
                controllers: [
                    AController,
                    BController
                ],
                providers: [
                    AProvider,
                    BProvider
                ],
            })
            export class MainModule {}`,
            errors: [
                {
                    messageId: "moduleMetadataArraysAreSorted",
                },
            ],
        },
    ],
});
