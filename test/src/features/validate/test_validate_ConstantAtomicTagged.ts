import typia from "typia";

import { ConstantAtomicTagged } from "../../structures/ConstantAtomicTagged";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantAtomicTagged = (): void =>
  _test_validate<ConstantAtomicTagged>({
    ...typia.json.schema<ConstantAtomicTagged>(),
    factory: ConstantAtomicTagged,
    name: "ConstantAtomicTagged",
  });
