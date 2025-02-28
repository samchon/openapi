import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagObjectUnion } from "../../structures/TypeTagObjectUnion";

export const test_validate_TypeTagObjectUnion = (): void =>
  _test_validate<TypeTagObjectUnion>({
    collection: typia.json.schemas<[TypeTagObjectUnion]>(),
    factory: TypeTagObjectUnion,
    name: "TypeTagObjectUnion",
  });
