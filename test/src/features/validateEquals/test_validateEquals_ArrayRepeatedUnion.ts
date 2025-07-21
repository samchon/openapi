import typia from "typia";

import { ArrayRepeatedUnion } from "../../structures/ArrayRepeatedUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRepeatedUnion = (): void =>
  _test_validateEquals<ArrayRepeatedUnion>({
    ...typia.json.schema<ArrayRepeatedUnion>(),
    factory: ArrayRepeatedUnion,
    name: "ArrayRepeatedUnion",
  });
