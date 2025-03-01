import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectHttpUndefindable } from "../../structures/ObjectHttpUndefindable";

export const test_validate_ObjectHttpUndefindable = (): void =>
  _test_validate<ObjectHttpUndefindable>({
    collection: typia.json.schemas<[ObjectHttpUndefindable]>(),
    factory: ObjectHttpUndefindable,
    name: "ObjectHttpUndefindable",
  });
