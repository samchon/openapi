import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagLength } from "../../structures/TypeTagLength";

export const test_validate_TypeTagLength = (): void =>
  _test_validate<TypeTagLength>({
    collection: typia.json.schemas<[TypeTagLength]>(),
    factory: TypeTagLength,
    name: "TypeTagLength",
  });
