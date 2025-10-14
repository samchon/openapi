import typia from "typia";

import { ArrayRepeatedNullable } from "../../structures/ArrayRepeatedNullable";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRepeatedNullable = (): void =>
  _test_validateEquals<ArrayRepeatedNullable>({
    ...typia.json.schema<ArrayRepeatedNullable>(),
    factory: ArrayRepeatedNullable,
    name: "ArrayRepeatedNullable",
  });
