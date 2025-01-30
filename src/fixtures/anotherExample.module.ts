import {Module} from "./Module.stub";
import TooManyTimesExampleProviderIncludedInModule from "./tooManyTimesExample.provider";

@Module({
    imports: [],
    controllers: [],
    providers: [TooManyTimesExampleProviderIncludedInModule],
})
export class ExampleModule {}
