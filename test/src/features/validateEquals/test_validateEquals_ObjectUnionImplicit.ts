import typia from "typia";

import { ObjectUnionImplicit } from "../../structures/ObjectUnionImplicit";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionImplicit = (): void =>
  _test_validateEquals<ObjectUnionImplicit>({
    ...typia.json.schema<ObjectUnionImplicit>(),
    factory: ObjectUnionImplicit,
    name: "ObjectUnionImplicit",
  });
