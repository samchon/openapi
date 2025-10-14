import typia from "typia";

import { TemplateAtomic } from "../../structures/TemplateAtomic";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TemplateAtomic = (): void =>
  _test_validateEquals<TemplateAtomic>({
    ...typia.json.schema<TemplateAtomic>(),
    factory: TemplateAtomic,
    name: "TemplateAtomic",
  });
