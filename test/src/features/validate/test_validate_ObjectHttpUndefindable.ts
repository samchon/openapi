import typia from "typia";

import { ObjectHttpUndefindable } from "../../structures/ObjectHttpUndefindable";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpUndefindable = (): void =>
  _test_validate<ObjectHttpUndefindable>({
    collection: typia.json.schemas<[ObjectHttpUndefindable]>(),
    factory: ObjectHttpUndefindable,
    name: "ObjectHttpUndefindable",
  });
