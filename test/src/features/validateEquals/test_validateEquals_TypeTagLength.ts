import typia from "typia";

import { TypeTagLength } from "../../structures/TypeTagLength";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagLength = (): void =>
  _test_validateEquals<TypeTagLength>({
    ...typia.json.schema<TypeTagLength>(),
    factory: TypeTagLength,
    name: "TypeTagLength",
  });
