import typia from "typia";

import { ObjectHttpTypeTag } from "../../structures/ObjectHttpTypeTag";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHttpTypeTag = (): void =>
  _test_validateEquals<ObjectHttpTypeTag>({
    ...typia.json.schema<ObjectHttpTypeTag>(),
    factory: ObjectHttpTypeTag,
    name: "ObjectHttpTypeTag",
  });
