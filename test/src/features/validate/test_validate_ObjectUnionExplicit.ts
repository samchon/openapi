import typia from "typia";

import { ObjectUnionExplicit } from "../../structures/ObjectUnionExplicit";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionExplicit = (): void =>
  _test_validate<ObjectUnionExplicit>({
    collection: typia.json.schemas<[ObjectUnionExplicit]>(),
    factory: ObjectUnionExplicit,
    name: "ObjectUnionExplicit",
  });
