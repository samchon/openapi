import typia from "typia";

import { ObjectInternal } from "../../structures/ObjectInternal";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectInternal = (): void =>
  _test_validateEquals<ObjectInternal>({
    ...typia.json.schema<ObjectInternal>(),
    factory: ObjectInternal,
    name: "ObjectInternal",
  });
