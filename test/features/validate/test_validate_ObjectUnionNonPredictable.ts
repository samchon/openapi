import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectUnionNonPredictable } from "../../structures/ObjectUnionNonPredictable";

export const test_validate_ObjectUnionNonPredictable = (): void =>
  _test_validate<ObjectUnionNonPredictable>({
    collection: typia.json.schemas<[ObjectUnionNonPredictable]>(),
    factory: ObjectUnionNonPredictable,
    name: "ObjectUnionNonPredictable",
  });
