import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { DynamicTag } from "../../structures/DynamicTag";

export const test_validate_DynamicTag = (): void =>
  _test_validate<DynamicTag>({
    collection: typia.json.schemas<[DynamicTag]>(),
    factory: DynamicTag,
    name: "DynamicTag",
  });
