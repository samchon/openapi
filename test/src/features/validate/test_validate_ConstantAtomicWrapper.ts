import typia from "typia";

import { ConstantAtomicWrapper } from "../../structures/ConstantAtomicWrapper";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantAtomicWrapper = (): void =>
  _test_validate<ConstantAtomicWrapper>({
    ...typia.json.schema<ConstantAtomicWrapper>(),
    factory: ConstantAtomicWrapper,
    name: "ConstantAtomicWrapper",
  });
