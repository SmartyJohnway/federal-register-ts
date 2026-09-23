import { Base } from "./base";
export interface ITopicAttributes {
    name: string;
    slug: string;
    url?: string;
}
export declare class Topic extends Base {
    get name(): string;
    get slug(): string;
    get url(): string | undefined;
    static suggestions(args?: Record<string, any>): Promise<Topic[]>;
}
//# sourceMappingURL=topic.d.ts.map