export const testCases = [
    {
        moduleCode: `export const MyOtherInjectableProvider: Provider = {
        provide: MyOtherInjectable,
        useFactory: async (
            config: MyService
        ): Promise<MyOtherInjectable> => {
            return new MyOtherInjectable()
        },
        inject: [MyService],
    };`,
        hasMismatch: false,
        message: "one injected, one param",
    },
    {
        moduleCode: `export const MyOtherInjectableProvider: NotAProvider = {
        provide: MyOtherInjectable,
        useFactory: async (
            config: MyService
        ): Promise<MyOtherInjectable> => {
            return new MyOtherInjectable()
        },
        inject: [MyService],
    };`,
        hasMismatch: false,
        message: "not a nest provider",
    },
    {
        moduleCode: `export const MyOtherInjectableProvider: Provider = {
        provide: MyOtherInjectable,
        useFactory: async (
        ): Promise<MyOtherInjectable> => {
            return new MyOtherInjectable()
        },
        inject: [],
    };`,
        hasMismatch: false,
        message: "empty inject, no params",
    },

    {
        moduleCode: `export const MyOtherInjectableProvider: Provider = {
        provide: MyOtherInjectable,
        useFactory: async (
        ): Promise<MyOtherInjectable> => {
            return new MyOtherInjectable()
        }
    };`,
        hasMismatch: false,
        message: "no inject, no params",
    },
    {
        moduleCode: `export const MyOtherInjectableProvider: Provider = {
        provide: MyOtherInjectable,
        useFactory: async (
            config: MyService
        ): Promise<MyOtherInjectable> => {
            return new MyOtherInjectable()
        },
        inject: [MyService,SecondService],
    };`,
        hasMismatch: true,
        message: "two injected, one param",
    },
    {
        moduleCode: `export const MyOtherInjectableProvider: Provider = {
        provide: MyOtherInjectable,
        useFactory: async (
            config: MyService,
            configTwo: MySecondService
        ): Promise<MyOtherInjectable> => {
            return new MyOtherInjectable()
        },
        inject: [MyService],
    };`,
        hasMismatch: true,
        message: "one injected, two param",
    },
];
