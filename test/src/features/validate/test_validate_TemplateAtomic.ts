import typia from "typia";

import { TemplateAtomic } from "../../structures/TemplateAtomic";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TemplateAtomic = (): void =>
  _test_validate<TemplateAtomic>({
    collection: typia.json.schemas<[TemplateAtomic]>(),
    factory: TemplateAtomic,
    name: "TemplateAtomic",
  });
