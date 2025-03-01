import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectDate } from "../../structures/ObjectDate";

export const test_validate_ObjectDate = (): void =>
  _test_validate<ObjectDate>({
    collection: typia.json.schemas<[ObjectDate]>(),
    factory: ObjectDate,
    name: "ObjectDate",
  });
