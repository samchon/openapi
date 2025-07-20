import typia from "typia";

import { DynamicTree } from "../../structures/DynamicTree";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_DynamicTree = (): void =>
  _test_validateEquals<DynamicTree>({
    ...typia.json.schema<DynamicTree>(),
    factory: DynamicTree,
    name: "DynamicTree",
  });
