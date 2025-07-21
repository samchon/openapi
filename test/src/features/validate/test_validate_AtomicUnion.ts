import typia from "typia";

import { AtomicUnion } from "../../structures/AtomicUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_AtomicUnion = (): void =>
  _test_validate<AtomicUnion>({
    ...typia.json.schema<AtomicUnion>(),
    factory: AtomicUnion,
    name: "AtomicUnion",
  });
