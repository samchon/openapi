import typia from "typia";

import { DynamicArray } from "../../structures/DynamicArray";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_DynamicArray = (): void =>
  _test_validateEquals<DynamicArray>({
    ...typia.json.schema<DynamicArray>(),
    factory: DynamicArray,
    name: "DynamicArray",
  });
