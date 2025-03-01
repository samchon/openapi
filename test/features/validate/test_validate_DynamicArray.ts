import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { DynamicArray } from "../../structures/DynamicArray";

export const test_validate_DynamicArray = (): void =>
  _test_validate<DynamicArray>({
    collection: typia.json.schemas<[DynamicArray]>(),
    factory: DynamicArray,
    name: "DynamicArray",
  });
