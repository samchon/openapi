import typia from "typia";

import { ArraySimple } from "../../structures/ArraySimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArraySimple = (): void =>
  _test_validate<ArraySimple>({
    ...typia.json.schema<ArraySimple>(),
    factory: ArraySimple,
    name: "ArraySimple",
  });
