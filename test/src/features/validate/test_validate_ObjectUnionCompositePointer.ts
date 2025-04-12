import typia from "typia";

import { ObjectUnionCompositePointer } from "../../structures/ObjectUnionCompositePointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionCompositePointer = (): void =>
  _test_validate<ObjectUnionCompositePointer>({
    collection: typia.json.schemas<[ObjectUnionCompositePointer]>(),
    factory: ObjectUnionCompositePointer,
    name: "ObjectUnionCompositePointer",
  });
