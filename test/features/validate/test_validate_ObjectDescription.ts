import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectDescription } from "../../structures/ObjectDescription";

export const test_validate_ObjectDescription = (): void =>
  _test_validate<ObjectDescription>({
    collection: typia.json.schemas<[ObjectDescription]>(),
    factory: ObjectDescription,
    name: "ObjectDescription",
  });
