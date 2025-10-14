import typia from "typia";

import { ObjectAlias } from "../../structures/ObjectAlias";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectAlias = (): void =>
  _test_validate<ObjectAlias>({
    ...typia.json.schema<ObjectAlias>(),
    factory: ObjectAlias,
    name: "ObjectAlias",
  });
