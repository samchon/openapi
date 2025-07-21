import typia from "typia";

import { TypeTagAtomicUnion } from "../../structures/TypeTagAtomicUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagAtomicUnion = (): void =>
  _test_validateEquals<TypeTagAtomicUnion>({
    ...typia.json.schema<TypeTagAtomicUnion>(),
    factory: TypeTagAtomicUnion,
    name: "TypeTagAtomicUnion",
  });
