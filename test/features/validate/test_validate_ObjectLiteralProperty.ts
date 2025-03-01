import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectLiteralProperty } from "../../structures/ObjectLiteralProperty";

export const test_validate_ObjectLiteralProperty = (): void =>
  _test_validate<ObjectLiteralProperty>({
    collection: typia.json.schemas<[ObjectLiteralProperty]>(),
    factory: ObjectLiteralProperty,
    name: "ObjectLiteralProperty",
  });
