// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\src\topic.ts

// Corresponds to federal_register/topic.rb

import { Base } from "./base";
import { Client } from "./client";

export interface ITopicAttributes {
  name: string;
  slug: string;
  url?: string;
}

export class Topic extends Base {
  public get name(): string { return this.getAttribute("name"); }
  public get slug(): string { return this.getAttribute("slug"); }
  public get url(): string | undefined { return this.getAttribute("url"); }

  // Corresponds to FederalRegister::Topic.suggestions
  public static async suggestions(args: Record<string, any> = {}): Promise<Topic[]> {
    const response = await Client.get("/topics/suggestions", args);
    return response.map((hsh: Record<string, any>) => new Topic(hsh, { full: true }));
  }
}
