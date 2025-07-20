import typia from "typia";

import { ObjectUnionNonPredictable } from "../../structures/ObjectUnionNonPredictable";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionNonPredictable = (): void =>
  _test_validateEquals<ObjectUnionNonPredictable>({
    ...typia.json.schema<ObjectUnionNonPredictable>(),
    factory: ObjectUnionNonPredictable,
    name: "ObjectUnionNonPredictable",
  });
