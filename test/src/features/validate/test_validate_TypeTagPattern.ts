import typia from "typia";

import { TypeTagPattern } from "../../structures/TypeTagPattern";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagPattern = (): void =>
  _test_validate<TypeTagPattern>({
    ...typia.json.schema<TypeTagPattern>(),
    factory: TypeTagPattern,
    name: "TypeTagPattern",
  });
