import typia from "typia";

import { ObjectDescription } from "../../structures/ObjectDescription";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectDescription = (): void =>
  _test_validateEquals<ObjectDescription>({
    ...typia.json.schema<ObjectDescription>(),
    factory: ObjectDescription,
    name: "ObjectDescription",
  });
