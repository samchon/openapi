import typia from "typia";

import { DynamicSimple } from "../../structures/DynamicSimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_DynamicSimple = (): void =>
  _test_validate<DynamicSimple>({
    collection: typia.json.schemas<[DynamicSimple]>(),
    factory: DynamicSimple,
    name: "DynamicSimple",
  });
