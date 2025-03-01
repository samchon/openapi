import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArrayHierarchicalPointer } from "../../structures/ArrayHierarchicalPointer";

export const test_validate_ArrayHierarchicalPointer = (): void =>
  _test_validate<ArrayHierarchicalPointer>({
    collection: typia.json.schemas<[ArrayHierarchicalPointer]>(),
    factory: ArrayHierarchicalPointer,
    name: "ArrayHierarchicalPointer",
  });
