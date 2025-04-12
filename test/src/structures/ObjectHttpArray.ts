import { Spoiler } from "../helpers/Spoiler";
import { TestRandomGenerator } from "../helpers/TestRandomGenerator";

export interface ObjectHttpArray {
  booleans: boolean[];
  numbers: number[];
  strings: string[];
  templates: Array<`something_${string}`>;
}
export namespace ObjectHttpArray {
  export const HEADERS = true;
  export const QUERY = true;
  export const JSONABLE = false;

  export function generate(): ObjectHttpArray {
    return {
      booleans: TestRandomGenerator.array(() => Math.random() < 0.5),
      numbers: TestRandomGenerator.array(() => TestRandomGenerator.number()),
      strings: TestRandomGenerator.array(() => TestRandomGenerator.string(10)),
      templates: TestRandomGenerator.array(
        () => `something_${TestRandomGenerator.string(10)}` as any,
      ),
    };
  }

  export const SPOILERS: Spoiler<ObjectHttpArray>[] = [
    (input) => {
      input.booleans = [false, true, "N" as any];
      return ["$input.booleans[2]"];
    },
    (input) => {
      input.numbers = [0, "one" as any];
      return ["$input.numbers[1]"];
    },
    (input) => {
      input.templates = ["something_a", "something_b", "nothing_c" as any];
      return ["$input.templates[2]"];
    },
  ];
}
