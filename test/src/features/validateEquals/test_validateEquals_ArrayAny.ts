import typia from "typia";

import { ArrayAny } from "../../structures/ArrayAny";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayAny = (): void =>
  _test_validateEquals<ArrayAny>({
    ...typia.json.schema<ArrayAny>(),
    factory: ArrayAny,
    name: "ArrayAny",
  });
