export class EnumTestResultModel {
    constructor(
        public needsTypeRemoved: boolean,
        public needsEnumNameAdded: boolean,
        public needsEnumNameToMatchEnumType: boolean
    ) {}
}
