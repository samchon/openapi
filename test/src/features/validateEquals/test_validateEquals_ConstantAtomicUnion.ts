import typia from "typia";

import { ConstantAtomicUnion } from "../../structures/ConstantAtomicUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantAtomicUnion = (): void =>
  _test_validateEquals<ConstantAtomicUnion>({
    ...typia.json.schema<ConstantAtomicUnion>(),
    factory: ConstantAtomicUnion,
    name: "ConstantAtomicUnion",
  });
