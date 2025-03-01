import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectRequired } from "../../structures/ObjectRequired";

export const test_validate_ObjectRequired = (): void =>
  _test_validate<ObjectRequired>({
    collection: typia.json.schemas<[ObjectRequired]>(),
    factory: ObjectRequired,
    name: "ObjectRequired",
  });
