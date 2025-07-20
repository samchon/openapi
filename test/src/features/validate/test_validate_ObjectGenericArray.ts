import typia from "typia";

import { ObjectGenericArray } from "../../structures/ObjectGenericArray";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectGenericArray = (): void =>
  _test_validate<ObjectGenericArray>({
    ...typia.json.schema<ObjectGenericArray>(),
    factory: ObjectGenericArray,
    name: "ObjectGenericArray",
  });
