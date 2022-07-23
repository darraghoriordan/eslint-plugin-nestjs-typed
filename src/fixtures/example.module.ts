import {Module} from "./Module.stub";
import ExampleProviderIncludedInModule from "./example.provider";
import {ExampleController} from "./example.controller";

@Module({
    imports: [],
    controllers: [ExampleController],
    providers: [ExampleProviderIncludedInModule],
})
export class ExampleModule {}
