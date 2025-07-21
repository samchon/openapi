import typia from "typia";

import { AtomicIntersection } from "../../structures/AtomicIntersection";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_AtomicIntersection = (): void =>
  _test_validateEquals<AtomicIntersection>({
    ...typia.json.schema<AtomicIntersection>(),
    factory: AtomicIntersection,
    name: "AtomicIntersection",
  });
