import typia from "typia";

import { ObjectNullable } from "../../structures/ObjectNullable";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectNullable = (): void =>
  _test_validateEquals<ObjectNullable>({
    ...typia.json.schema<ObjectNullable>(),
    factory: ObjectNullable,
    name: "ObjectNullable",
  });
