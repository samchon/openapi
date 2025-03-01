import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArrayRepeatedUnion } from "../../structures/ArrayRepeatedUnion";

export const test_validate_ArrayRepeatedUnion = (): void =>
  _test_validate<ArrayRepeatedUnion>({
    collection: typia.json.schemas<[ArrayRepeatedUnion]>(),
    factory: ArrayRepeatedUnion,
    name: "ArrayRepeatedUnion",
  });
