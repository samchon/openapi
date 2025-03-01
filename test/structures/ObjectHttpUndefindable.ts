import { Spoiler } from "../helpers/Spoiler";

export interface ObjectHttpUndefindable {
  boolean: boolean | undefined;
  number: number | undefined;
  string: string | undefined;

  constantBoolean: true | undefined;
  constantNumber: 1 | 2 | 3 | undefined;
  constantString: "one" | "two" | "three" | undefined;
}
export namespace ObjectHttpUndefindable {
  export const HEADERS = true;
  export const QUERY = true;
  export const JSONABLE = false;

  export function generate(): ObjectHttpUndefindable {
    return {
      boolean: undefined,
      number: 2,
      string: "three",

      constantBoolean: true,
      constantNumber: undefined,
      constantString: "three",
    };
  }

  export const SPOILERS: Spoiler<ObjectHttpUndefindable>[] = [
    (input) => {
      input.boolean = "N" as any;
      return ["$input.boolean"];
    },
    (input) => {
      input.number = "two" as any;
      return ["$input.number"];
    },
    (input) => {
      input.constantBoolean = false as any;
      return ["$input.constantBoolean"];
    },
    (input) => {
      input.constantNumber = 1.5 as any;
      return ["$input.constantNumber"];
    },
    (input) => {
      input.constantString = "four" as any;
      return ["$input.constantString"];
    },
  ];
}
