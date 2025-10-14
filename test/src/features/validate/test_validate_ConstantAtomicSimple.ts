import typia from "typia";

import { ConstantAtomicSimple } from "../../structures/ConstantAtomicSimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantAtomicSimple = (): void =>
  _test_validate<ConstantAtomicSimple>({
    ...typia.json.schema<ConstantAtomicSimple>(),
    factory: ConstantAtomicSimple,
    name: "ConstantAtomicSimple",
  });
