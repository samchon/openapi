import typia from "typia";

import { UltimateUnion } from "../../structures/UltimateUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_UltimateUnion = (): void =>
  _test_validateEquals<UltimateUnion>({
    ...typia.json.schema<UltimateUnion>(),
    factory: UltimateUnion,
    name: "UltimateUnion",
  });
