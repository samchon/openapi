import typia from "typia";

import { TypeTagFormat } from "../../structures/TypeTagFormat";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagFormat = (): void =>
  _test_validate<TypeTagFormat>({
    ...typia.json.schema<TypeTagFormat>(),
    factory: TypeTagFormat,
    name: "TypeTagFormat",
  });
