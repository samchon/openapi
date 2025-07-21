import typia from "typia";

import { ArrayRecursiveUnionExplicitPointer } from "../../structures/ArrayRecursiveUnionExplicitPointer";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRecursiveUnionExplicitPointer = (): void =>
  _test_validateEquals<ArrayRecursiveUnionExplicitPointer>({
    ...typia.json.schema<ArrayRecursiveUnionExplicitPointer>(),
    factory: ArrayRecursiveUnionExplicitPointer,
    name: "ArrayRecursiveUnionExplicitPointer",
  });
