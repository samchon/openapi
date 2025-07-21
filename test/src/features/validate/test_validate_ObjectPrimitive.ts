import typia from "typia";

import { ObjectPrimitive } from "../../structures/ObjectPrimitive";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectPrimitive = (): void =>
  _test_validate<ObjectPrimitive>({
    ...typia.json.schema<ObjectPrimitive>(),
    factory: ObjectPrimitive,
    name: "ObjectPrimitive",
  });
