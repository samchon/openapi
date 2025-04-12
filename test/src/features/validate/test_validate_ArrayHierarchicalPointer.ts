import typia from "typia";

import { ArrayHierarchicalPointer } from "../../structures/ArrayHierarchicalPointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayHierarchicalPointer = (): void =>
  _test_validate<ArrayHierarchicalPointer>({
    collection: typia.json.schemas<[ArrayHierarchicalPointer]>(),
    factory: ArrayHierarchicalPointer,
    name: "ArrayHierarchicalPointer",
  });
