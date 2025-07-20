import typia from "typia";

import { ArrayRepeatedNullable } from "../../structures/ArrayRepeatedNullable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRepeatedNullable = (): void =>
  _test_validate<ArrayRepeatedNullable>({
    ...typia.json.schema<ArrayRepeatedNullable>(),
    factory: ArrayRepeatedNullable,
    name: "ArrayRepeatedNullable",
  });
