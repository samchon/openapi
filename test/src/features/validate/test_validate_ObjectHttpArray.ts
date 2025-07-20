import typia from "typia";

import { ObjectHttpArray } from "../../structures/ObjectHttpArray";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpArray = (): void =>
  _test_validate<ObjectHttpArray>({
    ...typia.json.schema<ObjectHttpArray>(),
    factory: ObjectHttpArray,
    name: "ObjectHttpArray",
  });
