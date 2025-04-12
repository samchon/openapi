import typia from "typia";

import { TypeTagArrayUnion } from "../../structures/TypeTagArrayUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_TypeTagArrayUnion = (): void =>
  _test_validate<TypeTagArrayUnion>({
    collection: typia.json.schemas<[TypeTagArrayUnion]>(),
    factory: TypeTagArrayUnion,
    name: "TypeTagArrayUnion",
  });
