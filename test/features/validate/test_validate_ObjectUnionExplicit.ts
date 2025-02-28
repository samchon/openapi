import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectUnionExplicit } from "../../structures/ObjectUnionExplicit";

export const test_validate_ObjectUnionExplicit = (): void =>
  _test_validate<ObjectUnionExplicit>({
    collection: typia.json.schemas<[ObjectUnionExplicit]>(),
    factory: ObjectUnionExplicit,
    name: "ObjectUnionExplicit",
  });
