import typia from "typia";

import { TypeTagObjectUnion } from "../../structures/TypeTagObjectUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagObjectUnion = (): void =>
  _test_validate<TypeTagObjectUnion>({
    ...typia.json.schema<TypeTagObjectUnion>(),
    factory: TypeTagObjectUnion,
    name: "TypeTagObjectUnion",
  });
