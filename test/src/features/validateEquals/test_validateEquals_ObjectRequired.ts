import typia from "typia";

import { ObjectRequired } from "../../structures/ObjectRequired";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectRequired = (): void =>
  _test_validateEquals<ObjectRequired>({
    ...typia.json.schema<ObjectRequired>(),
    factory: ObjectRequired,
    name: "ObjectRequired",
  });
