import typia from "typia";

import { DynamicConstant } from "../../structures/DynamicConstant";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_DynamicConstant = (): void =>
  _test_validate<DynamicConstant>({
    ...typia.json.schema<DynamicConstant>(),
    factory: DynamicConstant,
    name: "DynamicConstant",
  });
