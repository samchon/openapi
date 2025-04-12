import typia from "typia";

import { ConstantEnumeration } from "../../structures/ConstantEnumeration";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantEnumeration = (): void =>
  _test_validate<ConstantEnumeration>({
    collection: typia.json.schemas<[ConstantEnumeration]>(),
    factory: ConstantEnumeration,
    name: "ConstantEnumeration",
  });
