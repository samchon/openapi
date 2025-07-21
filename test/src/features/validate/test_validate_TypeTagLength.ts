import typia from "typia";

import { TypeTagLength } from "../../structures/TypeTagLength";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagLength = (): void =>
  _test_validate<TypeTagLength>({
    ...typia.json.schema<TypeTagLength>(),
    factory: TypeTagLength,
    name: "TypeTagLength",
  });
