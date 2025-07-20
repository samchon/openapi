import typia from "typia";

import { ObjectSimple } from "../../structures/ObjectSimple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectSimple = (): void =>
  _test_validateEquals<ObjectSimple>({
    ...typia.json.schema<ObjectSimple>(),
    factory: ObjectSimple,
    name: "ObjectSimple",
  });
