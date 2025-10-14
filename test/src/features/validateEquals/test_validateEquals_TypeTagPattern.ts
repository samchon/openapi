import typia from "typia";

import { TypeTagPattern } from "../../structures/TypeTagPattern";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagPattern = (): void =>
  _test_validateEquals<TypeTagPattern>({
    ...typia.json.schema<TypeTagPattern>(),
    factory: TypeTagPattern,
    name: "TypeTagPattern",
  });
