import typia from "typia";

import { ObjectPropertyNullable } from "../../structures/ObjectPropertyNullable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectPropertyNullable = (): void =>
  _test_validate<ObjectPropertyNullable>({
    ...typia.json.schema<ObjectPropertyNullable>(),
    factory: ObjectPropertyNullable,
    name: "ObjectPropertyNullable",
  });
