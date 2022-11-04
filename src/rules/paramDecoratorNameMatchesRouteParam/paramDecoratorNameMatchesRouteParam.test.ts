/* eslint-disable unicorn/prevent-abbreviations */

import {pathPartTestCases, responseParsingTestCases} from "./rule.testData";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";

import rule, {
    isParameterNameIncludedInAPathPart,
    parsePathParts,
} from "./paramDecoratorNameMatchesRouteParam";

import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("param-decorator-name-matches-route-param", rule, {
    valid: [
        {
            //no param name provided - can't check anything
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get(":uuid")
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param() uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            
            }
            `,
        },
        {
            //mixed quotes shouldn't matter
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get(':uuid')
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            
            }
            `,
        },
        {
            // single quotes shouldn't matter
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get(':uuid')
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param('uuid') uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            
            }
            `,
        },
        {
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot/:uuid/my-controller")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
        },
        {
            // mix quote support test
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller('custom-bot/:uuid/my-controller')
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
        },
        {
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller({path:"custom-bot/:uuid/my-controller"})
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
        },
        {
            // mix quote support test
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller({path:'custom-bot/:uuid/my-controller'})
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
        },
        {
            // question mark in route means path is ignored by rule
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get(":uuid?")
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
        },
        {
            // asterix in route means path is ignored by rule
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get(":uu*id")
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
        },
    ],
    invalid: [
        {
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot/:uuid/my-controller")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param(":uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
            errors: [
                {
                    messageId: "paramIdentifierDoesntNeedColon",
                },
            ],
        },
        {
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot/:uuid/my-controller")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uui") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
            errors: [
                {
                    messageId: "paramIdentifierShouldMatch",
                },
            ],
        },
        {
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot/:uuidd/my-controller")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get()
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
            errors: [
                {
                    messageId: "paramIdentifierShouldMatch",
                },
            ],
        },
        {
            code: `
            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot/my-controller")
            export class CustomBotController {
                constructor(
                ) {}
            
                @Get([":uuidd"])
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
            errors: [
                {
                    messageId: "paramIdentifierShouldMatch",
                },
            ],
        },
    ],
});

describe("paramDecoratorParsePaths", () => {
    test.each(pathPartTestCases)(
        "is an expected response for %#",
        (testCase: {moduleCode: string; paths: string[]; message: string}) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const foundParts = parsePathParts(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
                (ast as any).body[0].decorators[0]
            );

            expect(foundParts).toEqual(testCase.paths);
        }
    );
});

describe("canMapToResponse", () => {
    test.each(responseParsingTestCases)(
        "is an expected response for %#",
        (testCase: {
            pathToCheck: string;
            paths: string[];
            shouldResult: boolean;
        }) => {
            const hasFoundParts = isParameterNameIncludedInAPathPart(
                testCase.pathToCheck,
                testCase.paths
            );

            expect(hasFoundParts).toEqual(testCase.shouldResult);
        }
    );
});
