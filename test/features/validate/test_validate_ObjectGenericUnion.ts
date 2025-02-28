import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectGenericUnion } from "../../structures/ObjectGenericUnion";

export const test_validate_ObjectGenericUnion = (): void =>
  _test_validate<ObjectGenericUnion>({
    collection: typia.json.schemas<[ObjectGenericUnion]>(),
    factory: ObjectGenericUnion,
    name: "ObjectGenericUnion",
  });
