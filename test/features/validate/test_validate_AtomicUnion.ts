import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { AtomicUnion } from "../../structures/AtomicUnion";

export const test_validate_AtomicUnion = (): void =>
  _test_validate<AtomicUnion>({
    collection: typia.json.schemas<[AtomicUnion]>(),
    factory: AtomicUnion,
    name: "AtomicUnion",
  });
