import typia from "typia";

import { ArrayRecursiveUnionImplicit } from "../../structures/ArrayRecursiveUnionImplicit";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRecursiveUnionImplicit = (): void =>
  _test_validateEquals<ArrayRecursiveUnionImplicit>({
    ...typia.json.schema<ArrayRecursiveUnionImplicit>(),
    factory: ArrayRecursiveUnionImplicit,
    name: "ArrayRecursiveUnionImplicit",
  });
