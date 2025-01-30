import {Module} from "./Module.stub";
import ExampleProviderIncludedInModule from "./example.provider";
import {ExampleController} from "./example.controller";
import {ExampleProvider} from "./example.customprovider";
import TooManyTimesExampleProviderIncludedInModule from "./tooManyTimesExample.provider";

@Module({
    imports: [],
    controllers: [ExampleController],
    providers: [
        ExampleProviderIncludedInModule,
        ExampleProvider,
        TooManyTimesExampleProviderIncludedInModule,
    ],
})
export class ExampleModule {}
