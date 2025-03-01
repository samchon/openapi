import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArrayHierarchical } from "../../structures/ArrayHierarchical";

export const test_validate_ArrayHierarchical = (): void =>
  _test_validate<ArrayHierarchical>({
    collection: typia.json.schemas<[ArrayHierarchical]>(),
    factory: ArrayHierarchical,
    name: "ArrayHierarchical",
  });
