### Rule: param-decorator-name-matches-route-param

This rule will verify you have entered a `Param("name")` that has a matching url parameter in a `@Controller()` or method decorator (like `@Get()` or `@Post()`)

NOTE: nestjs allows for fuzzy matching params in paths with `_+?()*` as regex params. This rule doesn't support parsing paths with regex so we will ignore any routes with these characters in them.

This rule also doesn't support variables or template strings. It will only work with single or double quoted strings.

this PASSES because the uuid param is in the `Get()` decorator

```ts
@Controller("custom-bot")
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

this PASSES because the uuid param is in the `Controller()` decorator

```ts
@Controller("custom-bot/:uuid")
export class CustomBotController {
    constructor() {}

    @Get()
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

This FAILS because there is a typo in the param decorator

```ts
@Controller("custom-bot")
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uui") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

this FAILS because you shouldn't put the `:` in the param decorator. This is just the way NestJS params work. You use ":" in the route to indicate the word is meant to be a param. But when using the @Param() decorator, you should just use the name, i.e. do not use ":". In the example below `@Param("uuid")` is correct.

```ts
@Controller("custom-bot")
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param(":uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

-----

### Configuration

This rule has two options that can be configured:

#### `shouldCheckController` (default: `true`)

If you want to skip checking the `@Controller()` name for route param matches, you can use this configuration

```ts
    "@darraghor/param-decorator-name-matches-route-param": [
            "error",
            { shouldCheckController: false },
        ],
```

With the `shouldCheckController: false` option set, the following rule will FAIL since the param `uui` does not match what is in the `@Get`. Normally this would be ignored since the `@Controller` contains a variable, which this rule cannot check the contents of.

```ts
import { SOME_PATH } from '../shared-paths';

@Controller(SOME_PATH)
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uui") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

#### `routerModulePaths` (default: `undefined`)

If you use `RouterModule.register()` to define parent routes with parameters, you can specify those route paths in the configuration. This allows the rule to validate params that come from RouterModule configuration.

```ts
    "@darraghor/param-decorator-name-matches-route-param": [
            "error",
            {
                shouldCheckController: true,
                routerModulePaths: ["columns/:columnid/tickets"]
            },
        ],
```

With this configuration, the following code will PASS even though `columnid` is not in the controller or method decorator, because it's defined in the RouterModule path:

```ts
@Controller("tickets")
export class TicketController {
    constructor() {}

    @Get()
    findAll(
        @Param("columnid") columnid: string
    ): Promise<Ticket[]> {
        // columnid comes from RouterModule.register() configuration
        return this.ticketService.findByColumn(columnid);
    }
}
```

You can specify multiple RouterModule paths with multiple parameters:

```ts
    "@darraghor/param-decorator-name-matches-route-param": [
            "error",
            {
                shouldCheckController: true,
                routerModulePaths: [
                    "projects/:projectid/columns/:columnid",
                    "companies/:companyid/api/:version"
                ]
            },
        ],
```

This is useful when you have a module structure like:

```ts
@Module({
    imports: [
        RouterModule.register([
            {
                path: 'columns/:columnid',
                module: TicketModule,
            },
        ]),
    ],
})
export class AppModule {}
```