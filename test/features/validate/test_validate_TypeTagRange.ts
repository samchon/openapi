import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagRange } from "../../structures/TypeTagRange";

export const test_validate_TypeTagRange = (): void =>
  _test_validate<TypeTagRange>({
    collection: typia.json.schemas<[TypeTagRange]>(),
    factory: TypeTagRange,
    name: "TypeTagRange",
  });
