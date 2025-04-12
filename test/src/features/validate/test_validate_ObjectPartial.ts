import typia from "typia";

import { ObjectPartial } from "../../structures/ObjectPartial";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectPartial = (): void =>
  _test_validate<ObjectPartial>({
    collection: typia.json.schemas<[ObjectPartial]>(),
    factory: ObjectPartial,
    name: "ObjectPartial",
  });
