import typia from "typia";

import { ArrayAtomicSimple } from "../../structures/ArrayAtomicSimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayAtomicSimple = (): void =>
  _test_validate<ArrayAtomicSimple>({
    ...typia.json.schema<ArrayAtomicSimple>(),
    factory: ArrayAtomicSimple,
    name: "ArrayAtomicSimple",
  });
