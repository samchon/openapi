import typia from "typia";

import { ConstantAtomicTagged } from "../../structures/ConstantAtomicTagged";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantAtomicTagged = (): void =>
  _test_validate<ConstantAtomicTagged>({
    collection: typia.json.schemas<[ConstantAtomicTagged]>(),
    factory: ConstantAtomicTagged,
    name: "ConstantAtomicTagged",
  });
