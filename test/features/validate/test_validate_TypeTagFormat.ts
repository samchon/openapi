import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagFormat } from "../../structures/TypeTagFormat";

export const test_validate_TypeTagFormat = (): void =>
  _test_validate<TypeTagFormat>({
    collection: typia.json.schemas<[TypeTagFormat]>(),
    factory: TypeTagFormat,
    name: "TypeTagFormat",
  });
