import typia from "typia";

import { DynamicEnumeration } from "../../structures/DynamicEnumeration";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_DynamicEnumeration = (): void =>
  _test_validateEquals<DynamicEnumeration>({
    ...typia.json.schema<DynamicEnumeration>(),
    factory: DynamicEnumeration,
    name: "DynamicEnumeration",
  });
