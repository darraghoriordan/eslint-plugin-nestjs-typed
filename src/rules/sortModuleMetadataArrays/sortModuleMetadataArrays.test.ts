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
            // Factory provider with inject array already in alphabetical order
            code: `@Module({
                providers: [
                    {
                        provide: 'EXAMPLE_PROVIDER',
                        useFactory: (aProvider: AProvider, bProvider: BProvider): unknown => {
                            return new WhatEver();
                        },
                        inject: [AProvider, BProvider],
                    }
                ]
            })
            export class MainModule {}`,
        },
        {
            // Factory provider with multiple dependencies already in alphabetical order
            code: `@Module({
                providers: [
                    {
                        provide: 'DATABASE_CONNECTION',
                        useFactory: (cache: CacheService, config: ConfigService, logger: Logger) => {
                            return createConnection(cache, config, logger);
                        },
                        inject: [CacheService, ConfigService, Logger],
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
            // but also warn about the unsorted inject array
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
                {
                    messageId: "factoryProviderInjectArrayShouldBeOrdered",
                },
            ],
        },
        {
            // Factory provider with unsorted inject array should show a warning
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
            errors: [
                {
                    messageId: "factoryProviderInjectArrayShouldBeOrdered",
                },
            ],
        },
        {
            // Factory provider with multiple unsorted dependencies
            code: `@Module({
                providers: [
                    {
                        provide: 'DATABASE_CONNECTION',
                        useFactory: (logger: Logger, cache: CacheService, config: ConfigService) => {
                            return createConnection(logger, cache, config);
                        },
                        inject: [Logger, CacheService, ConfigService],
                    }
                ]
            })
            export class MainModule {}`,
            errors: [
                {
                    messageId: "factoryProviderInjectArrayShouldBeOrdered",
                },
            ],
        },
    ],
});
