import typia from "typia";

import { ObjectLiteralProperty } from "../../structures/ObjectLiteralProperty";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectLiteralProperty = (): void =>
  _test_validateEquals<ObjectLiteralProperty>({
    ...typia.json.schema<ObjectLiteralProperty>(),
    factory: ObjectLiteralProperty,
    name: "ObjectLiteralProperty",
  });
