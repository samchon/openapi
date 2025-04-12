import typia from "typia";

import { ObjectNullable } from "../../structures/ObjectNullable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectNullable = (): void =>
  _test_validate<ObjectNullable>({
    collection: typia.json.schemas<[ObjectNullable]>(),
    factory: ObjectNullable,
    name: "ObjectNullable",
  });
