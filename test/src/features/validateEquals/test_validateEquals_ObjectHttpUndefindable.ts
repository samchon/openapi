import typia from "typia";

import { ObjectHttpUndefindable } from "../../structures/ObjectHttpUndefindable";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_ObjectHttpUndefindable = (): void =>
  _test_validateEquals<ObjectHttpUndefindable>({
    ...typia.json.schema<ObjectHttpUndefindable>(),
    factory: ObjectHttpUndefindable,
    name: "ObjectHttpUndefindable",
  });
