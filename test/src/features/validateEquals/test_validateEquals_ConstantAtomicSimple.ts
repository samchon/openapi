import typia from "typia";

import { ConstantAtomicSimple } from "../../structures/ConstantAtomicSimple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantAtomicSimple = (): void =>
  _test_validateEquals<ConstantAtomicSimple>({
    ...typia.json.schema<ConstantAtomicSimple>(),
    factory: ConstantAtomicSimple,
    name: "ConstantAtomicSimple",
  });
