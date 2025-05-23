import typia from "typia";

import { ArrayAtomicSimple } from "../../structures/ArrayAtomicSimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayAtomicSimple = (): void =>
  _test_validate<ArrayAtomicSimple>({
    collection: typia.json.schemas<[ArrayAtomicSimple]>(),
    factory: ArrayAtomicSimple,
    name: "ArrayAtomicSimple",
  });
