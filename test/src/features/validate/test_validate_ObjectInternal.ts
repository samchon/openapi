import typia from "typia";

import { ObjectInternal } from "../../structures/ObjectInternal";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectInternal = (): void =>
  _test_validate<ObjectInternal>({
    collection: typia.json.schemas<[ObjectInternal]>(),
    factory: ObjectInternal,
    name: "ObjectInternal",
  });
