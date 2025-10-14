import typia from "typia";

import { ObjectHttpConstant } from "../../structures/ObjectHttpConstant";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHttpConstant = (): void =>
  _test_validateEquals<ObjectHttpConstant>({
    ...typia.json.schema<ObjectHttpConstant>(),
    factory: ObjectHttpConstant,
    name: "ObjectHttpConstant",
  });
