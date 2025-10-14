import typia from "typia";

import { ArrayMatrix } from "../../structures/ArrayMatrix";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayMatrix = (): void =>
  _test_validate<ArrayMatrix>({
    ...typia.json.schema<ArrayMatrix>(),
    factory: ArrayMatrix,
    name: "ArrayMatrix",
  });
