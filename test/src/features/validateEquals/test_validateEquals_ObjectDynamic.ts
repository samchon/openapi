import typia from "typia";

import { ObjectDynamic } from "../../structures/ObjectDynamic";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectDynamic = (): void =>
  _test_validateEquals<ObjectDynamic>({
    ...typia.json.schema<ObjectDynamic>(),
    factory: ObjectDynamic,
    name: "ObjectDynamic",
  });
