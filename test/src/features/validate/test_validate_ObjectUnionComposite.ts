import typia from "typia";

import { ObjectUnionComposite } from "../../structures/ObjectUnionComposite";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionComposite = (): void =>
  _test_validate<ObjectUnionComposite>({
    collection: typia.json.schemas<[ObjectUnionComposite]>(),
    factory: ObjectUnionComposite,
    name: "ObjectUnionComposite",
  });
