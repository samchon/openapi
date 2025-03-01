import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagLength } from "../../structures/CommentTagLength";

export const test_validate_CommentTagLength = (): void =>
  _test_validate<CommentTagLength>({
    collection: typia.json.schemas<[CommentTagLength]>(),
    factory: CommentTagLength,
    name: "CommentTagLength",
  });
