import typia from "typia";

import { AtomicSimple } from "../../structures/AtomicSimple";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_AtomicSimple = (): void =>
  _test_validateEquals<AtomicSimple>({
    ...typia.json.schema<AtomicSimple>(),
    factory: AtomicSimple,
    name: "AtomicSimple",
  });
