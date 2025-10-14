import typia from "typia";

import { ArrayRecursiveUnionExplicitPointer } from "../../structures/ArrayRecursiveUnionExplicitPointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRecursiveUnionExplicitPointer = (): void =>
  _test_validate<ArrayRecursiveUnionExplicitPointer>({
    ...typia.json.schema<ArrayRecursiveUnionExplicitPointer>(),
    factory: ArrayRecursiveUnionExplicitPointer,
    name: "ArrayRecursiveUnionExplicitPointer",
  });
