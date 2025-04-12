import typia from "typia";

import { TypeTagAtomicUnion } from "../../structures/TypeTagAtomicUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagAtomicUnion = (): void =>
  _test_validate<TypeTagAtomicUnion>({
    collection: typia.json.schemas<[TypeTagAtomicUnion]>(),
    factory: TypeTagAtomicUnion,
    name: "TypeTagAtomicUnion",
  });
