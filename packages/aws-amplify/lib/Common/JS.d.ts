export default class JS {
    static isEmpty(obj: any): boolean;
    static sortByField(list: any, field: any, dir: any): boolean;
    static objectLessAttributes(obj: any, less: any): any;
    static filenameToContentType(filename: any, defVal?: string): string;
    static isTextFile(contentType: any): boolean;
    /**
     * generate random string
     */
    static generateRandomString(): string;
    static makeQuerablePromise(promise: any): any;
}
