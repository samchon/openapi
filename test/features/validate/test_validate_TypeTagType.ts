import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagType } from "../../structures/TypeTagType";

export const test_validate_TypeTagType = (): void =>
  _test_validate<TypeTagType>({
    collection: typia.json.schemas<[TypeTagType]>(),
    factory: TypeTagType,
    name: "TypeTagType",
  });
