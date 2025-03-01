import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectUnionDouble } from "../../structures/ObjectUnionDouble";

export const test_validate_ObjectUnionDouble = (): void =>
  _test_validate<ObjectUnionDouble>({
    collection: typia.json.schemas<[ObjectUnionDouble]>(),
    factory: ObjectUnionDouble,
    name: "ObjectUnionDouble",
  });
