import typia from "typia";

import { ConstantAtomicUnion } from "../../structures/ConstantAtomicUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantAtomicUnion = (): void =>
  _test_validate<ConstantAtomicUnion>({
    collection: typia.json.schemas<[ConstantAtomicUnion]>(),
    factory: ConstantAtomicUnion,
    name: "ConstantAtomicUnion",
  });
