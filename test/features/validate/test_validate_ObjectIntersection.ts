import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectIntersection } from "../../structures/ObjectIntersection";

export const test_validate_ObjectIntersection = (): void =>
  _test_validate<ObjectIntersection>({
    collection: typia.json.schemas<[ObjectIntersection]>(),
    factory: ObjectIntersection,
    name: "ObjectIntersection",
  });
