import typia from "typia";

import { ObjectHttpArray } from "../../structures/ObjectHttpArray";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHttpArray = (): void =>
  _test_validateEquals<ObjectHttpArray>({
    ...typia.json.schema<ObjectHttpArray>(),
    factory: ObjectHttpArray,
    name: "ObjectHttpArray",
  });
