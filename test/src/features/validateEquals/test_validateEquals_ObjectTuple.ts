import typia from "typia";

import { ObjectTuple } from "../../structures/ObjectTuple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectTuple = (): void =>
  _test_validateEquals<ObjectTuple>({
    ...typia.json.schema<ObjectTuple>(),
    factory: ObjectTuple,
    name: "ObjectTuple",
  });
