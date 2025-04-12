import typia from "typia";

import { ObjectUnionExplicitPointer } from "../../structures/ObjectUnionExplicitPointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionExplicitPointer = (): void =>
  _test_validate<ObjectUnionExplicitPointer>({
    collection: typia.json.schemas<[ObjectUnionExplicitPointer]>(),
    factory: ObjectUnionExplicitPointer,
    name: "ObjectUnionExplicitPointer",
  });
