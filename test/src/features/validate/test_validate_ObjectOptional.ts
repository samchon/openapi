import typia from "typia";

import { ObjectOptional } from "../../structures/ObjectOptional";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectOptional = (): void =>
  _test_validate<ObjectOptional>({
    ...typia.json.schema<ObjectOptional>(),
    factory: ObjectOptional,
    name: "ObjectOptional",
  });
