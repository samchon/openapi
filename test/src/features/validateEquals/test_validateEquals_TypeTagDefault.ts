import typia from "typia";

import { TypeTagDefault } from "../../structures/TypeTagDefault";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagDefault = (): void =>
  _test_validateEquals<TypeTagDefault>({
    ...typia.json.schema<TypeTagDefault>(),
    factory: TypeTagDefault,
    name: "TypeTagDefault",
  });
