import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagArray } from "../../structures/TypeTagArray";

export const test_validate_TypeTagArray = (): void =>
  _test_validate<TypeTagArray>({
    collection: typia.json.schemas<[TypeTagArray]>(),
    factory: TypeTagArray,
    name: "TypeTagArray",
  });
