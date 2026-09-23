export declare class Utilities {
    static extractOptions<T extends any[]>(args: T): [Record<string, any>, Exclude<T, Record<string, any>>];
}
/**
 * Recursively builds URLSearchParams for nested objects and arrays.
 * @param formData The URLSearchParams instance to append to.
 * @param key The current key.
 * @param data The data to append.
 */
export declare const buildParams: (formData: URLSearchParams, key: string, data: any) => void;
//# sourceMappingURL=utilities.d.ts.map