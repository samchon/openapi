import typia from "typia";

import { UltimateUnion } from "../../structures/UltimateUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_UltimateUnion = (): void =>
  _test_validate<UltimateUnion>({
    ...typia.json.schema<UltimateUnion>(),
    factory: UltimateUnion,
    name: "UltimateUnion",
  });
