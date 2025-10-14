import typia from "typia";

import { ArrayAtomicSimple } from "../../structures/ArrayAtomicSimple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayAtomicSimple = (): void =>
  _test_validateEquals<ArrayAtomicSimple>({
    ...typia.json.schema<ArrayAtomicSimple>(),
    factory: ArrayAtomicSimple,
    name: "ArrayAtomicSimple",
  });
