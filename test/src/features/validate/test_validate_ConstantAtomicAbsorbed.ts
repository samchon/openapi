import typia from "typia";

import { ConstantAtomicAbsorbed } from "../../structures/ConstantAtomicAbsorbed";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantAtomicAbsorbed = (): void =>
  _test_validate<ConstantAtomicAbsorbed>({
    collection: typia.json.schemas<[ConstantAtomicAbsorbed]>(),
    factory: ConstantAtomicAbsorbed,
    name: "ConstantAtomicAbsorbed",
  });
