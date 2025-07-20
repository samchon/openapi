import typia from "typia";

import { DynamicConstant } from "../../structures/DynamicConstant";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_DynamicConstant = (): void =>
  _test_validateEquals<DynamicConstant>({
    ...typia.json.schema<DynamicConstant>(),
    factory: DynamicConstant,
    name: "DynamicConstant",
  });
