import typia from "typia";

import { ObjectHttpConstant } from "../../structures/ObjectHttpConstant";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpConstant = (): void =>
  _test_validate<ObjectHttpConstant>({
    collection: typia.json.schemas<[ObjectHttpConstant]>(),
    factory: ObjectHttpConstant,
    name: "ObjectHttpConstant",
  });
