// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class IsFilteredPath {
    static test = (
        path: string | undefined,
        filteredStrings: string[] | undefined
    ): boolean => {
        if (!path) {
            return false;
        }
        const hasFoundFilter = filteredStrings?.some((setting: string) => {
            return new RegExp(`(${setting})`).test(path);
        });
        return hasFoundFilter ?? false;
    };
}

export default IsFilteredPath;
