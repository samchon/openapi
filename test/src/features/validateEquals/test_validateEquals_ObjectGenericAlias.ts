import typia from "typia";

import { ObjectGenericAlias } from "../../structures/ObjectGenericAlias";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectGenericAlias = (): void =>
  _test_validateEquals<ObjectGenericAlias>({
    ...typia.json.schema<ObjectGenericAlias>(),
    factory: ObjectGenericAlias,
    name: "ObjectGenericAlias",
  });
