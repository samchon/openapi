import typia from "typia";

import { ObjectGeneric } from "../../structures/ObjectGeneric";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectGeneric = (): void =>
  _test_validateEquals<ObjectGeneric>({
    ...typia.json.schema<ObjectGeneric>(),
    factory: ObjectGeneric,
    name: "ObjectGeneric",
  });
