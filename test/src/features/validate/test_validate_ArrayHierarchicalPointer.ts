import typia from "typia";

import { ArrayHierarchicalPointer } from "../../structures/ArrayHierarchicalPointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayHierarchicalPointer = (): void =>
  _test_validate<ArrayHierarchicalPointer>({
    ...typia.json.schema<ArrayHierarchicalPointer>(),
    factory: ArrayHierarchicalPointer,
    name: "ArrayHierarchicalPointer",
  });
