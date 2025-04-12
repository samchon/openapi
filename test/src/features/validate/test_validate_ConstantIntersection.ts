import typia from "typia";

import { ConstantIntersection } from "../../structures/ConstantIntersection";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ConstantIntersection = (): void =>
  _test_validate<ConstantIntersection>({
    collection: typia.json.schemas<[ConstantIntersection]>(),
    factory: ConstantIntersection,
    name: "ConstantIntersection",
  });
