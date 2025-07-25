import typia from "typia";

import { DynamicEnumeration } from "../../structures/DynamicEnumeration";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_DynamicEnumeration = (): void =>
  _test_validate<DynamicEnumeration>({
    ...typia.json.schema<DynamicEnumeration>(),
    factory: DynamicEnumeration,
    name: "DynamicEnumeration",
  });
