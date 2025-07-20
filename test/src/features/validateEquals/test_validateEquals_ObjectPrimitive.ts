import typia from "typia";

import { ObjectPrimitive } from "../../structures/ObjectPrimitive";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectPrimitive = (): void =>
  _test_validateEquals<ObjectPrimitive>({
    ...typia.json.schema<ObjectPrimitive>(),
    factory: ObjectPrimitive,
    name: "ObjectPrimitive",
  });
