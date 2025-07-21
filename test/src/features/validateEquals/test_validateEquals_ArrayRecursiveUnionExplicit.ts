import typia from "typia";

import { ArrayRecursiveUnionExplicit } from "../../structures/ArrayRecursiveUnionExplicit";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ArrayRecursiveUnionExplicit = (): void =>
  _test_validateEquals<ArrayRecursiveUnionExplicit>({
    ...typia.json.schema<ArrayRecursiveUnionExplicit>(),
    factory: ArrayRecursiveUnionExplicit,
    name: "ArrayRecursiveUnionExplicit",
  });
