import typia from "typia";

import { ArrayAny } from "../../structures/ArrayAny";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayAny = (): void =>
  _test_validate<ArrayAny>({
    collection: typia.json.schemas<[ArrayAny]>(),
    factory: ArrayAny,
    name: "ArrayAny",
  });
