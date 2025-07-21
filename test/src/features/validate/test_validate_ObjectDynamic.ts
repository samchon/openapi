import typia from "typia";

import { ObjectDynamic } from "../../structures/ObjectDynamic";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectDynamic = (): void =>
  _test_validate<ObjectDynamic>({
    ...typia.json.schema<ObjectDynamic>(),
    factory: ObjectDynamic,
    name: "ObjectDynamic",
  });
