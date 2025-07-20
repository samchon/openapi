import typia from "typia";

import { ObjectSimple } from "../../structures/ObjectSimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectSimple = (): void =>
  _test_validate<ObjectSimple>({
    ...typia.json.schema<ObjectSimple>(),
    factory: ObjectSimple,
    name: "ObjectSimple",
  });
