import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArrayAtomicAlias } from "../../structures/ArrayAtomicAlias";

export const test_validate_ArrayAtomicAlias = (): void =>
  _test_validate<ArrayAtomicAlias>({
    collection: typia.json.schemas<[ArrayAtomicAlias]>(),
    factory: ArrayAtomicAlias,
    name: "ArrayAtomicAlias",
  });
