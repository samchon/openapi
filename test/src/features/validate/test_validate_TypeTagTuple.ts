import typia from "typia";

import { TypeTagTuple } from "../../structures/TypeTagTuple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagTuple = (): void =>
  _test_validate<TypeTagTuple>({
    ...typia.json.schema<TypeTagTuple>(),
    factory: TypeTagTuple,
    name: "TypeTagTuple",
  });
