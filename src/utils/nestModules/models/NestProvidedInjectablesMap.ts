export class NestProvidedInjectablesMap {
    constructor(
        public filename: string,
        public controllers: Set<string>,
        public providers: Set<string>
    ) {}
}
