import typia from "typia";

import { ObjectUnionCompositePointer } from "../../structures/ObjectUnionCompositePointer";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionCompositePointer = (): void =>
  _test_validateEquals<ObjectUnionCompositePointer>({
    ...typia.json.schema<ObjectUnionCompositePointer>(),
    factory: ObjectUnionCompositePointer,
    name: "ObjectUnionCompositePointer",
  });
