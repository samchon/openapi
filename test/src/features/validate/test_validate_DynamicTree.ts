import typia from "typia";

import { DynamicTree } from "../../structures/DynamicTree";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_DynamicTree = (): void =>
  _test_validate<DynamicTree>({
    collection: typia.json.schemas<[DynamicTree]>(),
    factory: DynamicTree,
    name: "DynamicTree",
  });
