import typia from "typia";

import { ArrayRecursiveUnionImplicit } from "../../structures/ArrayRecursiveUnionImplicit";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRecursiveUnionImplicit = (): void =>
  _test_validate<ArrayRecursiveUnionImplicit>({
    ...typia.json.schema<ArrayRecursiveUnionImplicit>(),
    factory: ArrayRecursiveUnionImplicit,
    name: "ArrayRecursiveUnionImplicit",
  });
