import ShouldBeProvided from "./example.providedClass.provider";

export const ExampleProvider = {
    provide: ShouldBeProvided,
    useFactory: () => {
        return new ShouldBeProvided();
    },
};
