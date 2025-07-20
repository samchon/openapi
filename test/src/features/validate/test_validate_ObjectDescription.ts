import typia from "typia";

import { ObjectDescription } from "../../structures/ObjectDescription";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectDescription = (): void =>
  _test_validate<ObjectDescription>({
    ...typia.json.schema<ObjectDescription>(),
    factory: ObjectDescription,
    name: "ObjectDescription",
  });
