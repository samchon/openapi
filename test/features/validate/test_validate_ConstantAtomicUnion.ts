import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ConstantAtomicUnion } from "../../structures/ConstantAtomicUnion";

export const test_validate_ConstantAtomicUnion = (): void =>
  _test_validate<ConstantAtomicUnion>({
    collection: typia.json.schemas<[ConstantAtomicUnion]>(),
    factory: ConstantAtomicUnion,
    name: "ConstantAtomicUnion",
  });
