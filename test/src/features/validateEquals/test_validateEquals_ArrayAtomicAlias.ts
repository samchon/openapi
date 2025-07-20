import typia from "typia";

import { ArrayAtomicAlias } from "../../structures/ArrayAtomicAlias";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayAtomicAlias = (): void =>
  _test_validateEquals<ArrayAtomicAlias>({
    ...typia.json.schema<ArrayAtomicAlias>(),
    factory: ArrayAtomicAlias,
    name: "ArrayAtomicAlias",
  });
