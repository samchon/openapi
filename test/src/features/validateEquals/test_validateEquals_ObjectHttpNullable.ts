import typia from "typia";

import { ObjectHttpNullable } from "../../structures/ObjectHttpNullable";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHttpNullable = (): void =>
  _test_validateEquals<ObjectHttpNullable>({
    ...typia.json.schema<ObjectHttpNullable>(),
    factory: ObjectHttpNullable,
    name: "ObjectHttpNullable",
  });
