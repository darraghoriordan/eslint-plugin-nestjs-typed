### Rule: param-decorator-name-matches-route-param

This rule will verify you have entered a `Param("name")` that has a matching url parameter in a controller or method decorator

NOTE: nestjs allows for fuzzy matching params in paths with `_+?()*` as regex params. This rule doesn't support parsing paths with regex so we will ignore any routes with these characters in them.

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

this FAILS because you shouldn't put the `:` in the param decorator

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
