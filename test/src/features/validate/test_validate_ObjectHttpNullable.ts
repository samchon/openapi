import typia from "typia";

import { ObjectHttpNullable } from "../../structures/ObjectHttpNullable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpNullable = (): void =>
  _test_validate<ObjectHttpNullable>({
    collection: typia.json.schemas<[ObjectHttpNullable]>(),
    factory: ObjectHttpNullable,
    name: "ObjectHttpNullable",
  });
