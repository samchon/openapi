import typia from "typia";

import { TemplateConstant } from "../../structures/TemplateConstant";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TemplateConstant = (): void =>
  _test_validate<TemplateConstant>({
    ...typia.json.schema<TemplateConstant>(),
    factory: TemplateConstant,
    name: "TemplateConstant",
  });
