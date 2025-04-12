import typia from "typia";

import { ObjectPartialAndRequired } from "../../structures/ObjectPartialAndRequired";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectPartialAndRequired = (): void =>
  _test_validate<ObjectPartialAndRequired>({
    collection: typia.json.schemas<[ObjectPartialAndRequired]>(),
    factory: ObjectPartialAndRequired,
    name: "ObjectPartialAndRequired",
  });
