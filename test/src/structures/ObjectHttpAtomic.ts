import { Spoiler } from "../helpers/Spoiler";

export interface ObjectHttpAtomic {
  boolean: boolean;
  number: number;
  string: string;
}
export namespace ObjectHttpAtomic {
  export const HEADERS = true;
  export const QUERY = true;
  export const JSONABLE = false;

  export function generate(): ObjectHttpAtomic {
    return {
      boolean: true,
      number: 2,
      string: "three",
    };
  }

  export const SPOILERS: Spoiler<ObjectHttpAtomic>[] = [
    (input) => {
      input.boolean = "Y" as any;
      return ["$input.boolean"];
    },
    (input) => {
      input.number = "three" as any;
      return ["$input.number"];
    },
  ];
}
