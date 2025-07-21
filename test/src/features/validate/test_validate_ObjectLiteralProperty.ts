import typia from "typia";

import { ObjectLiteralProperty } from "../../structures/ObjectLiteralProperty";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectLiteralProperty = (): void =>
  _test_validate<ObjectLiteralProperty>({
    ...typia.json.schema<ObjectLiteralProperty>(),
    factory: ObjectLiteralProperty,
    name: "ObjectLiteralProperty",
  });
