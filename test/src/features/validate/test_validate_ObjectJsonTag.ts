import typia from "typia";

import { ObjectJsonTag } from "../../structures/ObjectJsonTag";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectJsonTag = (): void =>
  _test_validate<ObjectJsonTag>({
    ...typia.json.schema<ObjectJsonTag>(),
    factory: ObjectJsonTag,
    name: "ObjectJsonTag",
  });
