import typia from "typia";

import { TemplateUnion } from "../../structures/TemplateUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TemplateUnion = (): void =>
  _test_validate<TemplateUnion>({
    ...typia.json.schema<TemplateUnion>(),
    factory: TemplateUnion,
    name: "TemplateUnion",
  });
