import typia from "typia";

import { ObjectOptional } from "../../structures/ObjectOptional";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectOptional = (): void =>
  _test_validateEquals<ObjectOptional>({
    ...typia.json.schema<ObjectOptional>(),
    factory: ObjectOptional,
    name: "ObjectOptional",
  });
