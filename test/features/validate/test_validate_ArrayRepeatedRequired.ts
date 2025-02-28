import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArrayRepeatedRequired } from "../../structures/ArrayRepeatedRequired";

export const test_validate_ArrayRepeatedRequired = (): void =>
  _test_validate<ArrayRepeatedRequired>({
    collection: typia.json.schemas<[ArrayRepeatedRequired]>(),
    factory: ArrayRepeatedRequired,
    name: "ArrayRepeatedRequired",
  });
