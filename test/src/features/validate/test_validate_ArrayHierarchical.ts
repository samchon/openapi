import typia from "typia";

import { ArrayHierarchical } from "../../structures/ArrayHierarchical";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayHierarchical = (): void =>
  _test_validate<ArrayHierarchical>({
    ...typia.json.schema<ArrayHierarchical>(),
    factory: ArrayHierarchical,
    name: "ArrayHierarchical",
  });
