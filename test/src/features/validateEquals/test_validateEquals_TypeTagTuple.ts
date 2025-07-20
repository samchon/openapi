import typia from "typia";

import { TypeTagTuple } from "../../structures/TypeTagTuple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagTuple = (): void =>
  _test_validateEquals<TypeTagTuple>({
    ...typia.json.schema<TypeTagTuple>(),
    factory: TypeTagTuple,
    name: "TypeTagTuple",
  });
