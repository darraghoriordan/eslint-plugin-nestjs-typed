import {Module} from "./Module.stub";
import ExampleProviderIncludedInModule from "./example.provider";

const providers = [ExampleProviderIncludedInModule];

@Module({
    imports: [],
    providers: providers,
})
export class ProviderArrayModule {}
