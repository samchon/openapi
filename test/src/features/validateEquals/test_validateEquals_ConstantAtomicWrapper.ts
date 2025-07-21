import typia from "typia";

import { ConstantAtomicWrapper } from "../../structures/ConstantAtomicWrapper";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantAtomicWrapper = (): void =>
  _test_validateEquals<ConstantAtomicWrapper>({
    ...typia.json.schema<ConstantAtomicWrapper>(),
    factory: ConstantAtomicWrapper,
    name: "ConstantAtomicWrapper",
  });
