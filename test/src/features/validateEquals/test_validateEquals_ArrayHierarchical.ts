import typia from "typia";

import { ArrayHierarchical } from "../../structures/ArrayHierarchical";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayHierarchical = (): void =>
  _test_validateEquals<ArrayHierarchical>({
    ...typia.json.schema<ArrayHierarchical>(),
    factory: ArrayHierarchical,
    name: "ArrayHierarchical",
  });
