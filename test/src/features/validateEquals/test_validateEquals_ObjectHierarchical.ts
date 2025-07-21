import typia from "typia";

import { ObjectHierarchical } from "../../structures/ObjectHierarchical";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHierarchical = (): void =>
  _test_validateEquals<ObjectHierarchical>({
    ...typia.json.schema<ObjectHierarchical>(),
    factory: ObjectHierarchical,
    name: "ObjectHierarchical",
  });
