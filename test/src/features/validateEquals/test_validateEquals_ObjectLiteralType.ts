import typia from "typia";

import { ObjectLiteralType } from "../../structures/ObjectLiteralType";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectLiteralType = (): void =>
  _test_validateEquals<ObjectLiteralType>({
    ...typia.json.schema<ObjectLiteralType>(),
    factory: ObjectLiteralType,
    name: "ObjectLiteralType",
  });
