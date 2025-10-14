import typia from "typia";

import { ConstantConstEnumeration } from "../../structures/ConstantConstEnumeration";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantConstEnumeration = (): void =>
  _test_validateEquals<ConstantConstEnumeration>({
    ...typia.json.schema<ConstantConstEnumeration>(),
    factory: ConstantConstEnumeration,
    name: "ConstantConstEnumeration",
  });
