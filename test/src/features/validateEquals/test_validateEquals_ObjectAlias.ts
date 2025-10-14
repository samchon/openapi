import typia from "typia";

import { ObjectAlias } from "../../structures/ObjectAlias";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectAlias = (): void =>
  _test_validateEquals<ObjectAlias>({
    ...typia.json.schema<ObjectAlias>(),
    factory: ObjectAlias,
    name: "ObjectAlias",
  });
