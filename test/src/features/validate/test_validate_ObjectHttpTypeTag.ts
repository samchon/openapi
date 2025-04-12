import typia from "typia";

import { ObjectHttpTypeTag } from "../../structures/ObjectHttpTypeTag";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpTypeTag = (): void =>
  _test_validate<ObjectHttpTypeTag>({
    collection: typia.json.schemas<[ObjectHttpTypeTag]>(),
    factory: ObjectHttpTypeTag,
    name: "ObjectHttpTypeTag",
  });
