import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectHierarchical } from "../../structures/ObjectHierarchical";

export const test_validate_ObjectHierarchical = (): void =>
  _test_validate<ObjectHierarchical>({
    collection: typia.json.schemas<[ObjectHierarchical]>(),
    factory: ObjectHierarchical,
    name: "ObjectHierarchical",
  });
