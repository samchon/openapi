import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArrayMatrix } from "../../structures/ArrayMatrix";

export const test_validate_ArrayMatrix = (): void =>
  _test_validate<ArrayMatrix>({
    collection: typia.json.schemas<[ArrayMatrix]>(),
    factory: ArrayMatrix,
    name: "ArrayMatrix",
  });
