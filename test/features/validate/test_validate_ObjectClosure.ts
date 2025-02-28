import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { ObjectClosure } from "../../structures/ObjectClosure";

export const test_validate_ObjectClosure = (): void =>
  _test_validate<ObjectClosure>({
    collection: typia.json.schemas<[ObjectClosure]>(),
    factory: ObjectClosure,
    name: "ObjectClosure",
  });
