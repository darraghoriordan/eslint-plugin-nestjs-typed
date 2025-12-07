/* eslint-disable unicorn/prevent-abbreviations */

import {pathPartTestCases, responseParsingTestCases} from "./rule.testData.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData.js";

import rule, {
    isParameterNameIncludedInAPathPart,
    parsePathParts,
} from "./paramDecoratorNameMatchesRouteParam.js";

import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";

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
            // asterisk in route means path is ignored by rule
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
        {
            // variables in controller cause all to be ignored by rule, by default
            code: `
            const MY_VAR = "custom-bot/my-controller"

            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller(MY_VAR)
            export class CustomBotController {
                constructor(
                ) {}

                @Get(":uuid") //This mismatch is purposely ignored since the controller contains a variable
                async getMajorMedicalPlanFilters(
                  @Param('employerId', new ParseUUIDPipe()) employerId: string){}
            }`,
        },
        {
            // variables in route are ignored by rule
            code: `
            const MY_VAR="some/route"

            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller("custom-bot/my-controller")
            export class CustomBotController {
                constructor(
                ) {}

                @Get(FILTERS_URL)
                async getMajorMedicalPlanFilters(
                  @Param('employerId', new ParseUUIDPipe()) employerId: string){}
            }`,
        },
        {
            // template strings are ignored by rule
            code: `
            export class CustomBotController {
                @Put(\`onboarding-periods/:id/\${MAJOR_MEDICAL_PLAN_URL}\`)
            async upsertMajorMedicalPlan(
              @Param('id') periodId: string){}
            }`,
        },
        {
            // @Sse() decorator is supported
            code: `
            export class CustomBotController {
                @Sse(':chatId/message')
                async streamMessages(
                  @Param('chatId') chatId: string){}
            }`,
        },
        {
            // enum values in decorators are ignored by rule
            code: `
            enum AppRoutes {
                Root = 'app',
                VerifyParams = ':id',
            }

            @Controller(AppRoutes.Root)
            export class AppController {
                @Post(AppRoutes.VerifyParams)
                verifyParams(@Param('id') id: string) {
                    return { token: id };
                }
            }`,
        },
        {
            // static class properties in decorators are ignored by rule
            code: `
            class Routes {
                static Root = 'app';
                static VerifyParams = ':id';
            }

            @Controller(Routes.Root)
            export class AppController {
                @Post(Routes.VerifyParams)
                verifyParams(@Param('id') id: string) {
                    return { token: id };
                }
            }`,
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
                    data: {paramName: "uui"},
                    messageId: "paramIdentifierShouldMatchRouteOrController",
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
                    data: {paramName: "uuid"},
                    messageId: "paramIdentifierShouldMatchRouteOrController",
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
                    data: {paramName: "uuid"},
                    messageId: "paramIdentifierShouldMatchRouteOrController",
                },
            ],
        },
        {
            code: `
            var SOME_PATH = "custom-bot/my-controller";

            @ApiTags("Custom Bot")
            @ApiBearerAuth()
            @UseGuards(DefaultAuthGuard)
            @Controller(SOME_PATH)
            export class CustomBotController {
                constructor(
                ) {}

                @Get(":uuidd")
                @ApiOkResponse({ type: CustomBot })
                findOne(
                    @Param("uuid") uuid: string,
                    @Request() request: RequestWithUser
                ): Promise<CustomBot> {
                    return this.customBotService.findOne(uuid, request.user.uuid);
                }
            }
            `,
            options: [{shouldCheckController: false}],
            errors: [
                {
                    data: {paramName: "uuid"},
                    messageId: "paramIdentifierShouldMatchRouteOnly",
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
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
