import { tags } from "typia";

import { Spoiler } from "../helpers/Spoiler";
import { TestRandomGenerator } from "../helpers/TestRandomGenerator";

export interface ObjectHttpNullable {
  boolean: boolean | null;
  number: (number & tags.Minimum<1>) | null;
  string: string | null;

  constantBoolean: true | null;
  constantNumber: 1 | 2 | 3 | null;
  constantString: "one" | "two" | "three" | null;

  nullableArray: number[] | null;
}
export namespace ObjectHttpNullable {
  export const HEADERS = false;
  export const QUERY = true;
  export const QUERY_HEADERS = false;
  export const JSONABLE = false;

  export function generate(): ObjectHttpNullable {
    return {
      boolean: null,
      number: 2,
      string: "three",

      constantBoolean: true,
      constantNumber: null,
      constantString: "three",

      nullableArray: TestRandomGenerator.array(() =>
        TestRandomGenerator.number(),
      ),
    };
  }

  export const SPOILERS: Spoiler<ObjectHttpNullable>[] = [
    (input) => {
      input.boolean = undefined!;
      return ["$input.boolean"];
    },
    (input) => {
      input.number = 0;
      return ["$input.number"];
    },
    (input) => {
      input.number = undefined!;
      return ["$input.number"];
    },
    (input) => {
      input.string = undefined!;
      return ["$input.string"];
    },
    (input) => {
      input.constantBoolean = false as any;
      return ["$input.constantBoolean"];
    },
    (input) => {
      input.constantNumber = 0 as any;
      return ["$input.constantNumber"];
    },
    (input) => {
      input.constantString = undefined!;
      return ["$input.constantString"];
    },
    (input) => {
      input.nullableArray = [1, 2, "one", "two"] as any;
      return ["$input.nullableArray[2]", "$input.nullableArray[3]"];
    },
  ];
}
