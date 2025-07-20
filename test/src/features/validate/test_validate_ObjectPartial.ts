import typia from "typia";

import { ObjectPartial } from "../../structures/ObjectPartial";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectPartial = (): void =>
  _test_validate<ObjectPartial>({
    ...typia.json.schema<ObjectPartial>(),
    factory: ObjectPartial,
    name: "ObjectPartial",
  });
