import typia from "typia";

import { ArrayRepeatedRequired } from "../../structures/ArrayRepeatedRequired";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRepeatedRequired = (): void =>
  _test_validateEquals<ArrayRepeatedRequired>({
    ...typia.json.schema<ArrayRepeatedRequired>(),
    factory: ArrayRepeatedRequired,
    name: "ArrayRepeatedRequired",
  });
