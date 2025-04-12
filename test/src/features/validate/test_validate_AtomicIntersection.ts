import typia from "typia";

import { AtomicIntersection } from "../../structures/AtomicIntersection";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_AtomicIntersection = (): void =>
  _test_validate<AtomicIntersection>({
    collection: typia.json.schemas<[AtomicIntersection]>(),
    factory: AtomicIntersection,
    name: "AtomicIntersection",
  });
