import typia from "typia";

import { ObjectPropertyNullable } from "../../structures/ObjectPropertyNullable";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectPropertyNullable = (): void =>
  _test_validateEquals<ObjectPropertyNullable>({
    ...typia.json.schema<ObjectPropertyNullable>(),
    factory: ObjectPropertyNullable,
    name: "ObjectPropertyNullable",
  });
