import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagTypeUnion } from "../../structures/TypeTagTypeUnion";

export const test_validate_TypeTagTypeUnion = (): void =>
  _test_validate<TypeTagTypeUnion>({
    collection: typia.json.schemas<[TypeTagTypeUnion]>(),
    factory: TypeTagTypeUnion,
    name: "TypeTagTypeUnion",
  });
