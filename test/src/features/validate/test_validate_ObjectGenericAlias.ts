import typia from "typia";

import { ObjectGenericAlias } from "../../structures/ObjectGenericAlias";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectGenericAlias = (): void =>
  _test_validate<ObjectGenericAlias>({
    collection: typia.json.schemas<[ObjectGenericAlias]>(),
    factory: ObjectGenericAlias,
    name: "ObjectGenericAlias",
  });
