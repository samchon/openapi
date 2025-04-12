import typia from "typia";

import { DynamicArray } from "../../structures/DynamicArray";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_DynamicArray = (): void =>
  _test_validate<DynamicArray>({
    collection: typia.json.schemas<[DynamicArray]>(),
    factory: DynamicArray,
    name: "DynamicArray",
  });
