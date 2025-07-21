import typia from "typia";

import { TypeTagMatrix } from "../../structures/TypeTagMatrix";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagMatrix = (): void =>
  _test_validateEquals<TypeTagMatrix>({
    ...typia.json.schema<TypeTagMatrix>(),
    factory: TypeTagMatrix,
    name: "TypeTagMatrix",
  });
