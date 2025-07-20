import typia from "typia";

import { ObjectGenericUnion } from "../../structures/ObjectGenericUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectGenericUnion = (): void =>
  _test_validate<ObjectGenericUnion>({
    ...typia.json.schema<ObjectGenericUnion>(),
    factory: ObjectGenericUnion,
    name: "ObjectGenericUnion",
  });
