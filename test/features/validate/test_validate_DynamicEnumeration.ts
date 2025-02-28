import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { DynamicEnumeration } from "../../structures/DynamicEnumeration";

export const test_validate_DynamicEnumeration = (): void =>
  _test_validate<DynamicEnumeration>({
    collection: typia.json.schemas<[DynamicEnumeration]>(),
    factory: DynamicEnumeration,
    name: "DynamicEnumeration",
  });
