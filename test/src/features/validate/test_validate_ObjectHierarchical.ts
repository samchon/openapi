import typia from "typia";

import { ObjectHierarchical } from "../../structures/ObjectHierarchical";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHierarchical = (): void =>
  _test_validate<ObjectHierarchical>({
    ...typia.json.schema<ObjectHierarchical>(),
    factory: ObjectHierarchical,
    name: "ObjectHierarchical",
  });
