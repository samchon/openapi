import typia from "typia";

import { ObjectUnionDouble } from "../../structures/ObjectUnionDouble";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionDouble = (): void =>
  _test_validate<ObjectUnionDouble>({
    collection: typia.json.schemas<[ObjectUnionDouble]>(),
    factory: ObjectUnionDouble,
    name: "ObjectUnionDouble",
  });
