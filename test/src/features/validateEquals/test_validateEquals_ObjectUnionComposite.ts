import typia from "typia";

import { ObjectUnionComposite } from "../../structures/ObjectUnionComposite";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectUnionComposite = (): void =>
  _test_validateEquals<ObjectUnionComposite>({
    ...typia.json.schema<ObjectUnionComposite>(),
    factory: ObjectUnionComposite,
    name: "ObjectUnionComposite",
  });
