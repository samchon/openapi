import typia from "typia";

import { ObjectGenericAlias } from "../../structures/ObjectGenericAlias";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectGenericAlias = (): void =>
  _test_validate<ObjectGenericAlias>({
    ...typia.json.schema<ObjectGenericAlias>(),
    factory: ObjectGenericAlias,
    name: "ObjectGenericAlias",
  });
