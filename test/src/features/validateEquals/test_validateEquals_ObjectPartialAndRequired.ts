import typia from "typia";

import { ObjectPartialAndRequired } from "../../structures/ObjectPartialAndRequired";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectPartialAndRequired = (): void =>
  _test_validateEquals<ObjectPartialAndRequired>({
    ...typia.json.schema<ObjectPartialAndRequired>(),
    factory: ObjectPartialAndRequired,
    name: "ObjectPartialAndRequired",
  });
