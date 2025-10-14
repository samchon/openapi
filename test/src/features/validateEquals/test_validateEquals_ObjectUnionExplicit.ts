import typia from "typia";

import { ObjectUnionExplicit } from "../../structures/ObjectUnionExplicit";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionExplicit = (): void =>
  _test_validateEquals<ObjectUnionExplicit>({
    ...typia.json.schema<ObjectUnionExplicit>(),
    factory: ObjectUnionExplicit,
    name: "ObjectUnionExplicit",
  });
