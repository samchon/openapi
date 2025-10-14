import typia from "typia";

import { ConstantAtomicAbsorbed } from "../../structures/ConstantAtomicAbsorbed";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantAtomicAbsorbed = (): void =>
  _test_validateEquals<ConstantAtomicAbsorbed>({
    ...typia.json.schema<ConstantAtomicAbsorbed>(),
    factory: ConstantAtomicAbsorbed,
    name: "ConstantAtomicAbsorbed",
  });
