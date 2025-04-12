import typia from "typia";

import { ObjectHttpAtomic } from "../../structures/ObjectHttpAtomic";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_ObjectHttpAtomic = (): void =>
  _test_validate<ObjectHttpAtomic>({
    collection: typia.json.schemas<[ObjectHttpAtomic]>(),
    factory: ObjectHttpAtomic,
    name: "ObjectHttpAtomic",
  });
