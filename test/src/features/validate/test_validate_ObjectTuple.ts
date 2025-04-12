import typia from "typia";

import { ObjectTuple } from "../../structures/ObjectTuple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectTuple = (): void =>
  _test_validate<ObjectTuple>({
    collection: typia.json.schemas<[ObjectTuple]>(),
    factory: ObjectTuple,
    name: "ObjectTuple",
  });
