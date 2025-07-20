import typia from "typia";

import { ObjectJsonTag } from "../../structures/ObjectJsonTag";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectJsonTag = (): void =>
  _test_validateEquals<ObjectJsonTag>({
    ...typia.json.schema<ObjectJsonTag>(),
    factory: ObjectJsonTag,
    name: "ObjectJsonTag",
  });
