import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./sortModuleMetadataArrays.js";

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
        {
            // Factory provider with inject array should NOT be sorted
            // The inject array order must match the useFactory parameters
            code: `@Module({
                providers: [
                    {
                        provide: 'EXAMPLE_PROVIDER',
                        useFactory: (bProvider: BProvider, aProvider: AProvider): unknown => {
                            return new WhatEver();
                        },
                        inject: [BProvider, AProvider],
                    }
                ]
            })
            export class MainModule {}`,
        },
        {
            // Factory provider with multiple dependencies in specific order
            code: `@Module({
                providers: [
                    {
                        provide: 'DATABASE_CONNECTION',
                        useFactory: (config: ConfigService, logger: Logger, cache: CacheService) => {
                            return createConnection(config, logger, cache);
                        },
                        inject: [ConfigService, Logger, CacheService],
                    }
                ]
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
        {
            // Module with factory provider - should sort top-level providers array
            // but NOT the inject array
            code: `@Module({
                providers: [
                    BProvider,
                    {
                        provide: 'EXAMPLE_PROVIDER',
                        useFactory: (bProvider: BProvider, aProvider: AProvider): unknown => {
                            return new WhatEver();
                        },
                        inject: [BProvider, AProvider],
                    },
                    AProvider,
                ]
            })
            export class MainModule {}`,
            output: [
                `@Module({
                providers: [
                    {
                        provide: 'EXAMPLE_PROVIDER',
                        useFactory: (bProvider: BProvider, aProvider: AProvider): unknown => {
                            return new WhatEver();
                        },
                        inject: [BProvider, AProvider],
                    },
                    BProvider,
                    AProvider,
                ]
            })
            export class MainModule {}`,
                `@Module({
                providers: [
                    {
                        provide: 'EXAMPLE_PROVIDER',
                        useFactory: (bProvider: BProvider, aProvider: AProvider): unknown => {
                            return new WhatEver();
                        },
                        inject: [BProvider, AProvider],
                    },
                    AProvider,
                    BProvider,
                ]
            })
            export class MainModule {}`,
            ],
            errors: [
                {
                    messageId: "moduleMetadataArraysAreSorted",
                },
            ],
        },
    ],
});
