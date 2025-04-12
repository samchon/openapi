import typia from "typia";

import { ObjectRequired } from "../../structures/ObjectRequired";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectRequired = (): void =>
  _test_validate<ObjectRequired>({
    collection: typia.json.schemas<[ObjectRequired]>(),
    factory: ObjectRequired,
    name: "ObjectRequired",
  });
