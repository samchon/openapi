import typia from "typia";

import { ArrayRecursive } from "../../structures/ArrayRecursive";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRecursive = (): void =>
  _test_validateEquals<ArrayRecursive>({
    ...typia.json.schema<ArrayRecursive>(),
    factory: ArrayRecursive,
    name: "ArrayRecursive",
  });
