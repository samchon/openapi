import { tags } from "typia";
import { ArrayUtil } from "typia/lib/utils/ArrayUtil";

import { Spoiler } from "../helpers/Spoiler";
import { TestRandomGenerator } from "../helpers/TestRandomGenerator";

export interface DynamicTag {
  [key: number & tags.Minimum<0> & tags.ExclusiveMaximum<10>]: number &
    tags.Type<"uint64">;
  [key: string & tags.Format<"uuid">]: string & tags.Format<"email">;
}
export namespace DynamicTag {
  export const BINARABLE = false;
  export const JSONABLE = false;
  export const PRIMITIVE = false;
  export const ADDABLE = false;

  export function generate(): DynamicTag {
    const dict: DynamicTag = {};
    ArrayUtil.repeat(10, (i) => {
      dict[i] = TestRandomGenerator.integer(0, 1_000_000);
      dict[TestRandomGenerator.uuid()] = TestRandomGenerator.email();
    });
    return dict;
  }

  export const SPOILERS: Spoiler<DynamicTag>[] = [
    (input) => {
      input[0] = false as any;
      return [`$input["0"]`];
    },
    (input) => {
      input[9] = -1;
      return [`$input["9"]`];
    },
    (input) => {
      const uuid: string = TestRandomGenerator.uuid();
      input[uuid] = "not-email-address";
      return [`$input["${uuid}"]`];
    },
  ];
}
