import typia from "typia";

import { ConstantEnumeration } from "../../structures/ConstantEnumeration";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantEnumeration = (): void =>
  _test_validateEquals<ConstantEnumeration>({
    ...typia.json.schema<ConstantEnumeration>(),
    factory: ConstantEnumeration,
    name: "ConstantEnumeration",
  });
