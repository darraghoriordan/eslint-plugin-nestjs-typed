import {Module} from "./Module.stub";
import ExampleProviderIncludedInModule from "./example.provider";
import {ExampleController} from "./example.controller";
import {ExampleProvider} from "./example.customprovider";

@Module({
    imports: [],
    controllers: [ExampleController],
    providers: [ExampleProviderIncludedInModule, ExampleProvider],
})
export class ExampleModule {}
