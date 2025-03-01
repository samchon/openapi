import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectSimple } from "../../structures/ObjectSimple";

export const test_validate_ObjectSimple = (): void =>
  _test_validate<ObjectSimple>({
    collection: typia.json.schemas<[ObjectSimple]>(),
    factory: ObjectSimple,
    name: "ObjectSimple",
  });
