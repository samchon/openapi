import typia from "typia";

import { TemplateAtomic } from "../../structures/TemplateAtomic";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TemplateAtomic = (): void =>
  _test_validate<TemplateAtomic>({
    ...typia.json.schema<TemplateAtomic>(),
    factory: TemplateAtomic,
    name: "TemplateAtomic",
  });
