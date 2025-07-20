import typia from "typia";

import { ConstantAtomicTagged } from "../../structures/ConstantAtomicTagged";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantAtomicTagged = (): void =>
  _test_validateEquals<ConstantAtomicTagged>({
    ...typia.json.schema<ConstantAtomicTagged>(),
    factory: ConstantAtomicTagged,
    name: "ConstantAtomicTagged",
  });
