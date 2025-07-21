import typia from "typia";

import { AtomicAlias } from "../../structures/AtomicAlias";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_AtomicAlias = (): void =>
  _test_validateEquals<AtomicAlias>({
    ...typia.json.schema<AtomicAlias>(),
    factory: AtomicAlias,
    name: "AtomicAlias",
  });
