import typia from "typia";

import { ArrayRecursiveUnionExplicit } from "../../structures/ArrayRecursiveUnionExplicit";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ArrayRecursiveUnionExplicit = (): void =>
  _test_validate<ArrayRecursiveUnionExplicit>({
    ...typia.json.schema<ArrayRecursiveUnionExplicit>(),
    factory: ArrayRecursiveUnionExplicit,
    name: "ArrayRecursiveUnionExplicit",
  });
