import typia from "typia";

import { ObjectUndefined } from "../../structures/ObjectUndefined";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUndefined = (): void =>
  _test_validateEquals<ObjectUndefined>({
    ...typia.json.schema<ObjectUndefined>(),
    factory: ObjectUndefined,
    name: "ObjectUndefined",
  });
