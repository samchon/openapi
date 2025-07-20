import typia from "typia";

import { ArrayMatrix } from "../../structures/ArrayMatrix";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayMatrix = (): void =>
  _test_validateEquals<ArrayMatrix>({
    ...typia.json.schema<ArrayMatrix>(),
    factory: ArrayMatrix,
    name: "ArrayMatrix",
  });
