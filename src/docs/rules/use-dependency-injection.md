# use-dependency-injection

Enforce using dependency injection through constructor parameters rather than property initialization.

## Rule Details

Classes decorated with `@Injectable()`, `@Controller()`, `@Component()`, or `@Service()` should follow the dependency injection principle. Dependencies must be provided through the class constructor, not instantiated directly within the class.

This rule helps maintain proper separation of concerns and makes your code more testable by ensuring all dependencies are injected rather than being tightly coupled through direct instantiation.

### ❌ Incorrect

```typescript
@Injectable()
export class CatService {
    private logger = new Logger(); // ❌ Direct instantiation
}
```

```typescript
@Injectable()
export class CatService {
    logger;
    constructor() {
        this.logger = new Logger(); // ❌ Instantiation in constructor
    }
}
```

```typescript
@Injectable()
export class CatService {
    private logger = require('bunyan'); // ❌ Direct require call
}
```

```typescript
import bunyan from 'bunyan';

@Injectable()
export class CatService {
    private logger = bunyan; // ❌ Using imported module directly
}
```

### ✅ Correct

```typescript
@Injectable()
export class CatService {
    constructor(private logger: Logger) {} // ✅ Injected via constructor
}
```

```typescript
@Injectable()
export class CatService {
    private logger: Logger;
    
    constructor(logger: Logger) {
        this.logger = logger; // ✅ Assigned from injected parameter
    }
}
```

```typescript
@Injectable()
export class CatService {
    private readonly maxRetries = 3; // ✅ Primitive constants are OK
    private name = 'CatService'; // ✅ String literals are OK
}
```

```typescript
@Injectable()
export class CatService {
    private config = { debug: true }; // ✅ Object literals are OK
}
```

## Options

This rule has no options.

## When Not To Use It

If you're not using NestJS's dependency injection system or working with utility classes that don't participate in the DI container, you can disable this rule for those files using:

```typescript
/* eslint-disable @darraghor/nestjs-typed/use-dependency-injection */
```

Or disable it for specific lines:

```typescript
@Injectable()
export class CatService {
    // eslint-disable-next-line @darraghor/nestjs-typed/use-dependency-injection
    private logger = new Logger();
}
```

## Further Reading

- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
- [Testing with Dependency Injection](https://martinfowler.com/articles/injection.html)
