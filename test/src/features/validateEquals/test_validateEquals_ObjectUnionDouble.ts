import typia from "typia";

import { ObjectUnionDouble } from "../../structures/ObjectUnionDouble";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionDouble = (): void =>
  _test_validateEquals<ObjectUnionDouble>({
    ...typia.json.schema<ObjectUnionDouble>(),
    factory: ObjectUnionDouble,
    name: "ObjectUnionDouble",
  });
