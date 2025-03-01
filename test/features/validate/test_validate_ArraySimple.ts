import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ArraySimple } from "../../structures/ArraySimple";

export const test_validate_ArraySimple = (): void =>
  _test_validate<ArraySimple>({
    collection: typia.json.schemas<[ArraySimple]>(),
    factory: ArraySimple,
    name: "ArraySimple",
  });
