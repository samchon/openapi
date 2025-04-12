import typia from "typia";

import { ArrayRecursiveUnionExplicitPointer } from "../../structures/ArrayRecursiveUnionExplicitPointer";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRecursiveUnionExplicitPointer = (): void =>
  _test_validate<ArrayRecursiveUnionExplicitPointer>({
    collection: typia.json.schemas<[ArrayRecursiveUnionExplicitPointer]>(),
    factory: ArrayRecursiveUnionExplicitPointer,
    name: "ArrayRecursiveUnionExplicitPointer",
  });
