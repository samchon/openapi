import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { DynamicComposite } from "../../structures/DynamicComposite";

export const test_validate_DynamicComposite = (): void =>
  _test_validate<DynamicComposite>({
    collection: typia.json.schemas<[DynamicComposite]>(),
    factory: DynamicComposite,
    name: "DynamicComposite",
  });
