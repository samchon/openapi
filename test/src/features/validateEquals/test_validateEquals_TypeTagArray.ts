import typia from "typia";

import { TypeTagArray } from "../../structures/TypeTagArray";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagArray = (): void =>
  _test_validateEquals<TypeTagArray>({
    ...typia.json.schema<TypeTagArray>(),
    factory: TypeTagArray,
    name: "TypeTagArray",
  });
