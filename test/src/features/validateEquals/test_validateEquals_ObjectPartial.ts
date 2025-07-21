import typia from "typia";

import { ObjectPartial } from "../../structures/ObjectPartial";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectPartial = (): void =>
  _test_validateEquals<ObjectPartial>({
    ...typia.json.schema<ObjectPartial>(),
    factory: ObjectPartial,
    name: "ObjectPartial",
  });
