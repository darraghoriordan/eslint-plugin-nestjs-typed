export class EnumTestResultModel {
    constructor(init: EnumTestResultModel) {
        this.needsEnumAdded = init.needsEnumAdded;
        this.needsEnumNameAdded = init.needsEnumNameAdded;
        this.needsTypeRemoved = init.needsTypeRemoved;
        this.needsEnumNameToMatchEnumType = init.needsEnumNameToMatchEnumType;
    }
    public needsEnumAdded: boolean;
    public needsTypeRemoved: boolean;
    public needsEnumNameAdded: boolean;
    public needsEnumNameToMatchEnumType: boolean;
}
