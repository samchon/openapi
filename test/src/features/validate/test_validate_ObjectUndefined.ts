import typia from "typia";

import { ObjectUndefined } from "../../structures/ObjectUndefined";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUndefined = (): void =>
  _test_validate<ObjectUndefined>({
    collection: typia.json.schemas<[ObjectUndefined]>(),
    factory: ObjectUndefined,
    name: "ObjectUndefined",
  });
