import typia from "typia";

import { ObjectUnionComposite } from "../../structures/ObjectUnionComposite";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectUnionComposite = (): void =>
  _test_validate<ObjectUnionComposite>({
    ...typia.json.schema<ObjectUnionComposite>(),
    factory: ObjectUnionComposite,
    name: "ObjectUnionComposite",
  });
