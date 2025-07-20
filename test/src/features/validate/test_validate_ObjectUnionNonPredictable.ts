import typia from "typia";

import { ObjectUnionNonPredictable } from "../../structures/ObjectUnionNonPredictable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionNonPredictable = (): void =>
  _test_validate<ObjectUnionNonPredictable>({
    ...typia.json.schema<ObjectUnionNonPredictable>(),
    factory: ObjectUnionNonPredictable,
    name: "ObjectUnionNonPredictable",
  });
