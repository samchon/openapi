import typia from "typia";

import { CommentTagLength } from "../../structures/CommentTagLength";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagLength = (): void =>
  _test_validate<CommentTagLength>({
    ...typia.json.schema<CommentTagLength>(),
    factory: CommentTagLength,
    name: "CommentTagLength",
  });
