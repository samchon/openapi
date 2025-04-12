import typia from "typia";

import { ObjectRecursive } from "../../structures/ObjectRecursive";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectRecursive = (): void =>
  _test_validate<ObjectRecursive>({
    collection: typia.json.schemas<[ObjectRecursive]>(),
    factory: ObjectRecursive,
    name: "ObjectRecursive",
  });
