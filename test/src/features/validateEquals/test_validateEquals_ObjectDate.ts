import typia from "typia";

import { ObjectDate } from "../../structures/ObjectDate";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectDate = (): void =>
  _test_validateEquals<ObjectDate>({
    ...typia.json.schema<ObjectDate>(),
    factory: ObjectDate,
    name: "ObjectDate",
  });
