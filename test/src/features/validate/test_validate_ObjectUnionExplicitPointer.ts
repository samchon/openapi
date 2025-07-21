import typia from "typia";

import { ObjectUnionExplicitPointer } from "../../structures/ObjectUnionExplicitPointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionExplicitPointer = (): void =>
  _test_validate<ObjectUnionExplicitPointer>({
    ...typia.json.schema<ObjectUnionExplicitPointer>(),
    factory: ObjectUnionExplicitPointer,
    name: "ObjectUnionExplicitPointer",
  });
