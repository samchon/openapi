import typia from "typia";

import { ArrayRecursive } from "../../structures/ArrayRecursive";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRecursive = (): void =>
  _test_validate<ArrayRecursive>({
    collection: typia.json.schemas<[ArrayRecursive]>(),
    factory: ArrayRecursive,
    name: "ArrayRecursive",
  });
