import typia from "typia";

import { ObjectUnionImplicit } from "../../structures/ObjectUnionImplicit";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionImplicit = (): void =>
  _test_validate<ObjectUnionImplicit>({
    ...typia.json.schema<ObjectUnionImplicit>(),
    factory: ObjectUnionImplicit,
    name: "ObjectUnionImplicit",
  });
