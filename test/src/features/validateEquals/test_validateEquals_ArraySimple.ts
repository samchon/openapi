import typia from "typia";

import { ArraySimple } from "../../structures/ArraySimple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArraySimple = (): void =>
  _test_validateEquals<ArraySimple>({
    ...typia.json.schema<ArraySimple>(),
    factory: ArraySimple,
    name: "ArraySimple",
  });
