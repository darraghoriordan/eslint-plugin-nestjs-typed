import {Module} from "./Module.stub";
import ExampleProviderIncludedInModule from "./example.provider";

@Module({
    imports: [],
    providers: [ExampleProviderIncludedInModule],
})
export class ExampleModule {}
