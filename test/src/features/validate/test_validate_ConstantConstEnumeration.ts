import typia from "typia";

import { ConstantConstEnumeration } from "../../structures/ConstantConstEnumeration";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantConstEnumeration = (): void =>
  _test_validate<ConstantConstEnumeration>({
    collection: typia.json.schemas<[ConstantConstEnumeration]>(),
    factory: ConstantConstEnumeration,
    name: "ConstantConstEnumeration",
  });
