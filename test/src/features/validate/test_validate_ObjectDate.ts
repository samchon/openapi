import typia from "typia";

import { ObjectDate } from "../../structures/ObjectDate";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectDate = (): void =>
  _test_validate<ObjectDate>({
    ...typia.json.schema<ObjectDate>(),
    factory: ObjectDate,
    name: "ObjectDate",
  });
