import typia from "typia";

import { TypeTagDefault } from "../../structures/TypeTagDefault";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagDefault = (): void =>
  _test_validate<TypeTagDefault>({
    collection: typia.json.schemas<[TypeTagDefault]>(),
    factory: TypeTagDefault,
    name: "TypeTagDefault",
  });
