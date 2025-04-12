import typia from "typia";

import { ObjectLiteralType } from "../../structures/ObjectLiteralType";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectLiteralType = (): void =>
  _test_validate<ObjectLiteralType>({
    collection: typia.json.schemas<[ObjectLiteralType]>(),
    factory: ObjectLiteralType,
    name: "ObjectLiteralType",
  });
