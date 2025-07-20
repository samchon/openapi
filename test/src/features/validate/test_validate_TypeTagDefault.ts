import typia from "typia";

import { TypeTagDefault } from "../../structures/TypeTagDefault";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagDefault = (): void =>
  _test_validate<TypeTagDefault>({
    ...typia.json.schema<TypeTagDefault>(),
    factory: TypeTagDefault,
    name: "TypeTagDefault",
  });
