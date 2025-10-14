import typia from "typia";

import { TypeTagObjectUnion } from "../../structures/TypeTagObjectUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagObjectUnion = (): void =>
  _test_validateEquals<TypeTagObjectUnion>({
    ...typia.json.schema<TypeTagObjectUnion>(),
    factory: TypeTagObjectUnion,
    name: "TypeTagObjectUnion",
  });
