import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ConstantIntersection } from "../../structures/ConstantIntersection";

export const test_validate_ConstantIntersection = (): void =>
  _test_validate<ConstantIntersection>({
    collection: typia.json.schemas<[ConstantIntersection]>(),
    factory: ConstantIntersection,
    name: "ConstantIntersection",
  });
