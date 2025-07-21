import typia from "typia";

import { TypeTagMatrix } from "../../structures/TypeTagMatrix";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagMatrix = (): void =>
  _test_validate<TypeTagMatrix>({
    ...typia.json.schema<TypeTagMatrix>(),
    factory: TypeTagMatrix,
    name: "TypeTagMatrix",
  });
