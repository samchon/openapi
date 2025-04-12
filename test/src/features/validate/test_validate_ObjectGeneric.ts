import typia from "typia";

import { ObjectGeneric } from "../../structures/ObjectGeneric";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectGeneric = (): void =>
  _test_validate<ObjectGeneric>({
    collection: typia.json.schemas<[ObjectGeneric]>(),
    factory: ObjectGeneric,
    name: "ObjectGeneric",
  });
