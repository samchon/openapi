import typia from "typia";

import { ObjectHttpAtomic } from "../../structures/ObjectHttpAtomic";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHttpAtomic = (): void =>
  _test_validateEquals<ObjectHttpAtomic>({
    ...typia.json.schema<ObjectHttpAtomic>(),
    factory: ObjectHttpAtomic,
    name: "ObjectHttpAtomic",
  });
