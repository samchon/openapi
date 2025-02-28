import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { TypeTagCustom } from "../../structures/TypeTagCustom";

export const test_validate_TypeTagCustom = (): void =>
  _test_validate<TypeTagCustom>({
    collection: typia.json.schemas<[TypeTagCustom]>(),
    factory: TypeTagCustom,
    name: "TypeTagCustom",
  });
