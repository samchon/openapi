import typia from "typia";

import { ObjectHttpConstant } from "../../structures/ObjectHttpConstant";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpConstant = (): void =>
  _test_validate<ObjectHttpConstant>({
    ...typia.json.schema<ObjectHttpConstant>(),
    factory: ObjectHttpConstant,
    name: "ObjectHttpConstant",
  });
