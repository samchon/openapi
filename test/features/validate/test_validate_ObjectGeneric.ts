import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectGeneric } from "../../structures/ObjectGeneric";

export const test_validate_ObjectGeneric = (): void =>
  _test_validate<ObjectGeneric>({
    collection: typia.json.schemas<[ObjectGeneric]>(),
    factory: ObjectGeneric,
    name: "ObjectGeneric",
  });
