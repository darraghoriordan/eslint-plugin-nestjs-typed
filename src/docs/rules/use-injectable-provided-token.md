### Rule: use-injectable-provided-token

In NestJS, the special tokens `APP_GUARD`, `APP_PIPE`, `APP_FILTER`, and `APP_INTERCEPTOR` are used to register global providers. These tokens cannot be retrieved using `app.get()` or injected using `@Inject()` because they work differently from regular providers - they are applied globally at the framework level.

Attempting to use these tokens with `app.get()` or `@Inject()` will result in runtime errors. They should only be used in module provider arrays.

This rule is enabled by default in the recommended configuration.

#### ❌ This FAILS

Using `app.get()` with APP_* tokens:

```ts
// These will fail at runtime
const guard = app.get(APP_GUARD);
const pipe = app.get(APP_PIPE);
const filter = app.get(APP_FILTER);
const interceptor = app.get(APP_INTERCEPTOR);
```

Using `@Inject()` with APP_* tokens:

```ts
@Injectable()
class MyService {
  // These will fail at runtime
  constructor(
    @Inject(APP_GUARD) private guard: any,
    @Inject(APP_PIPE) private pipe: any,
    @Inject(APP_FILTER) private filter: any,
    @Inject(APP_INTERCEPTOR) private interceptor: any
  ) {}
}
```

#### ✅ This PASSES

Using APP_* tokens correctly in module providers:

```ts
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

Using `app.get()` with regular services:

```ts
const myService = app.get(MyService);
const configService = app.get(ConfigService);
```

Using `@Inject()` with regular tokens:

```ts
@Injectable()
class MyService {
  constructor(
    @Inject(ConfigService) private config: ConfigService,
    @Inject('CUSTOM_TOKEN') private customProvider: any,
  ) {}
}
```

#### Related Documentation

- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [NestJS Pipes Documentation](https://docs.nestjs.com/pipes)
- [NestJS Exception Filters Documentation](https://docs.nestjs.com/exception-filters)
- [NestJS Interceptors Documentation](https://docs.nestjs.com/interceptors)
- [GitHub Issue #2178](https://github.com/nestjs/docs.nestjs.com/issues/2178)
