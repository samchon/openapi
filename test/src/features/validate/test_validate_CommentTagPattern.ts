import typia from "typia";

import { CommentTagPattern } from "../../structures/CommentTagPattern";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagPattern = (): void =>
  _test_validate<CommentTagPattern>({
    ...typia.json.schema<CommentTagPattern>(),
    factory: CommentTagPattern,
    name: "CommentTagPattern",
  });
