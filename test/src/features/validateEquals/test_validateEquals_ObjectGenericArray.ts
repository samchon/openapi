import typia from "typia";

import { ObjectGenericArray } from "../../structures/ObjectGenericArray";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectGenericArray = (): void =>
  _test_validateEquals<ObjectGenericArray>({
    ...typia.json.schema<ObjectGenericArray>(),
    factory: ObjectGenericArray,
    name: "ObjectGenericArray",
  });
