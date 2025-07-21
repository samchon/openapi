import typia from "typia";

import { ArrayRepeatedRequired } from "../../structures/ArrayRepeatedRequired";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRepeatedRequired = (): void =>
  _test_validate<ArrayRepeatedRequired>({
    ...typia.json.schema<ArrayRepeatedRequired>(),
    factory: ArrayRepeatedRequired,
    name: "ArrayRepeatedRequired",
  });
