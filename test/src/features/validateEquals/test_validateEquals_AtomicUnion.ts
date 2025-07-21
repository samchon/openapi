import typia from "typia";

import { AtomicUnion } from "../../structures/AtomicUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_AtomicUnion = (): void =>
  _test_validateEquals<AtomicUnion>({
    ...typia.json.schema<AtomicUnion>(),
    factory: AtomicUnion,
    name: "AtomicUnion",
  });
