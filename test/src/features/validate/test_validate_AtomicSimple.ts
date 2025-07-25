import typia from "typia";

import { AtomicSimple } from "../../structures/AtomicSimple";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_AtomicSimple = (): void =>
  _test_validate<AtomicSimple>({
    ...typia.json.schema<AtomicSimple>(),
    factory: AtomicSimple,
    name: "AtomicSimple",
  });
