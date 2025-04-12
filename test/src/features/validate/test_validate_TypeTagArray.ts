import typia from "typia";

import { TypeTagArray } from "../../structures/TypeTagArray";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagArray = (): void =>
  _test_validate<TypeTagArray>({
    collection: typia.json.schemas<[TypeTagArray]>(),
    factory: TypeTagArray,
    name: "TypeTagArray",
  });
