import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectHttpNullable } from "../../structures/ObjectHttpNullable";

export const test_validate_ObjectHttpNullable = (): void =>
  _test_validate<ObjectHttpNullable>({
    collection: typia.json.schemas<[ObjectHttpNullable]>(),
    factory: ObjectHttpNullable,
    name: "ObjectHttpNullable",
  });
