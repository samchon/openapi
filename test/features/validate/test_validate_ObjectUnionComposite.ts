import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectUnionComposite } from "../../structures/ObjectUnionComposite";

export const test_validate_ObjectUnionComposite = (): void =>
  _test_validate<ObjectUnionComposite>({
    collection: typia.json.schemas<[ObjectUnionComposite]>(),
    factory: ObjectUnionComposite,
    name: "ObjectUnionComposite",
  });
