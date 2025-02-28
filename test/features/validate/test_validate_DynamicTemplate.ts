import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { DynamicTemplate } from "../../structures/DynamicTemplate";

export const test_validate_DynamicTemplate = (): void =>
  _test_validate<DynamicTemplate>({
    collection: typia.json.schemas<[DynamicTemplate]>(),
    factory: DynamicTemplate,
    name: "DynamicTemplate",
  });
