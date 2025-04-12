import typia from "typia";

import { ObjectHttpArray } from "../../structures/ObjectHttpArray";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpArray = (): void =>
  _test_validate<ObjectHttpArray>({
    collection: typia.json.schemas<[ObjectHttpArray]>(),
    factory: ObjectHttpArray,
    name: "ObjectHttpArray",
  });
