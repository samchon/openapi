import typia from "typia";

import { TypeTagFormat } from "../../structures/TypeTagFormat";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagFormat = (): void =>
  _test_validateEquals<TypeTagFormat>({
    ...typia.json.schema<TypeTagFormat>(),
    factory: TypeTagFormat,
    name: "TypeTagFormat",
  });
