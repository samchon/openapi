import typia from "typia";

import { ObjectPropertyNullable } from "../../structures/ObjectPropertyNullable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectPropertyNullable = (): void =>
  _test_validate<ObjectPropertyNullable>({
    collection: typia.json.schemas<[ObjectPropertyNullable]>(),
    factory: ObjectPropertyNullable,
    name: "ObjectPropertyNullable",
  });
