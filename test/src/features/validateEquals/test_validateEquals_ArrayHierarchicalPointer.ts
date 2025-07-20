import typia from "typia";

import { ArrayHierarchicalPointer } from "../../structures/ArrayHierarchicalPointer";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayHierarchicalPointer = (): void =>
  _test_validateEquals<ArrayHierarchicalPointer>({
    ...typia.json.schema<ArrayHierarchicalPointer>(),
    factory: ArrayHierarchicalPointer,
    name: "ArrayHierarchicalPointer",
  });
