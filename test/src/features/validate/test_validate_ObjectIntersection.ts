import typia from "typia";

import { ObjectIntersection } from "../../structures/ObjectIntersection";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectIntersection = (): void =>
  _test_validate<ObjectIntersection>({
    collection: typia.json.schemas<[ObjectIntersection]>(),
    factory: ObjectIntersection,
    name: "ObjectIntersection",
  });
