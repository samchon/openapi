import typia from "typia";

import { AtomicAlias } from "../../structures/AtomicAlias";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_AtomicAlias = (): void =>
  _test_validate<AtomicAlias>({
    ...typia.json.schema<AtomicAlias>(),
    factory: AtomicAlias,
    name: "AtomicAlias",
  });
