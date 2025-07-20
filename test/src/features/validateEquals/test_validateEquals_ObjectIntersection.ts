import typia from "typia";

import { ObjectIntersection } from "../../structures/ObjectIntersection";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectIntersection = (): void =>
  _test_validateEquals<ObjectIntersection>({
    ...typia.json.schema<ObjectIntersection>(),
    factory: ObjectIntersection,
    name: "ObjectIntersection",
  });
