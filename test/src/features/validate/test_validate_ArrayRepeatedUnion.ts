import typia from "typia";

import { ArrayRepeatedUnion } from "../../structures/ArrayRepeatedUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRepeatedUnion = (): void =>
  _test_validate<ArrayRepeatedUnion>({
    ...typia.json.schema<ArrayRepeatedUnion>(),
    factory: ArrayRepeatedUnion,
    name: "ArrayRepeatedUnion",
  });
