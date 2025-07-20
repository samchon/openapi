import typia from "typia";

import { ObjectGenericUnion } from "../../structures/ObjectGenericUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectGenericUnion = (): void =>
  _test_validateEquals<ObjectGenericUnion>({
    ...typia.json.schema<ObjectGenericUnion>(),
    factory: ObjectGenericUnion,
    name: "ObjectGenericUnion",
  });
