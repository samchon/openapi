import typia from "typia";

import { TemplateUnion } from "../../structures/TemplateUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TemplateUnion = (): void =>
  _test_validateEquals<TemplateUnion>({
    ...typia.json.schema<TemplateUnion>(),
    factory: TemplateUnion,
    name: "TemplateUnion",
  });
