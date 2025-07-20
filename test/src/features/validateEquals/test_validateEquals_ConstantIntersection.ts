import typia from "typia";

import { ConstantIntersection } from "../../structures/ConstantIntersection";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ConstantIntersection = (): void =>
  _test_validateEquals<ConstantIntersection>({
    ...typia.json.schema<ConstantIntersection>(),
    factory: ConstantIntersection,
    name: "ConstantIntersection",
  });
