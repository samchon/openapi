import typia from "typia";

import { TypeTagArrayUnion } from "../../structures/TypeTagArrayUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_TypeTagArrayUnion = (): void =>
  _test_validateEquals<TypeTagArrayUnion>({
    ...typia.json.schema<TypeTagArrayUnion>(),
    factory: TypeTagArrayUnion,
    name: "TypeTagArrayUnion",
  });
