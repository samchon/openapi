import typia from "typia";

import { ObjectUnionExplicitPointer } from "../../structures/ObjectUnionExplicitPointer";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionExplicitPointer = (): void =>
  _test_validateEquals<ObjectUnionExplicitPointer>({
    ...typia.json.schema<ObjectUnionExplicitPointer>(),
    factory: ObjectUnionExplicitPointer,
    name: "ObjectUnionExplicitPointer",
  });
