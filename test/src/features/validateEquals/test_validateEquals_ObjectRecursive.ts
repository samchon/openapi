import typia from "typia";

import { ObjectRecursive } from "../../structures/ObjectRecursive";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectRecursive = (): void =>
  _test_validateEquals<ObjectRecursive>({
    ...typia.json.schema<ObjectRecursive>(),
    factory: ObjectRecursive,
    name: "ObjectRecursive",
  });
