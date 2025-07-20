import typia from "typia";

import { TemplateConstant } from "../../structures/TemplateConstant";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TemplateConstant = (): void =>
  _test_validateEquals<TemplateConstant>({
    ...typia.json.schema<TemplateConstant>(),
    factory: TemplateConstant,
    name: "TemplateConstant",
  });
