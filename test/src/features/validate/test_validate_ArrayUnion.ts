import typia from "typia";

import { ArrayUnion } from "../../structures/ArrayUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayUnion = (): void =>
  _test_validate<ArrayUnion>({
    ...typia.json.schema<ArrayUnion>(),
    factory: ArrayUnion,
    name: "ArrayUnion",
  });
