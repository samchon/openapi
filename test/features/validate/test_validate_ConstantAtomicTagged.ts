import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ConstantAtomicTagged } from "../../structures/ConstantAtomicTagged";

export const test_validate_ConstantAtomicTagged = (): void =>
  _test_validate<ConstantAtomicTagged>({
    collection: typia.json.schemas<[ConstantAtomicTagged]>(),
    factory: ConstantAtomicTagged,
    name: "ConstantAtomicTagged",
  });
