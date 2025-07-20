import typia from "typia";

import { DynamicSimple } from "../../structures/DynamicSimple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_DynamicSimple = (): void =>
  _test_validateEquals<DynamicSimple>({
    ...typia.json.schema<DynamicSimple>(),
    factory: DynamicSimple,
    name: "DynamicSimple",
  });
