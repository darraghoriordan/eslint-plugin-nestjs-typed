export type NestProvidedFilePath = string;

export class NestProvidedInjectablesMap {
    constructor(
        public controllers: Set<string>,
        public providers: Set<string>
    ) {}
}
