import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { UltimateUnion } from "../../structures/UltimateUnion";

export const test_validate_UltimateUnion = (): void =>
  _test_validate<UltimateUnion>({
    collection: typia.json.schemas<[UltimateUnion]>(),
    factory: UltimateUnion,
    name: "UltimateUnion",
  });
