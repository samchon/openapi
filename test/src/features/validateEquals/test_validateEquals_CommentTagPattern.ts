import typia from "typia";

import { CommentTagPattern } from "../../structures/CommentTagPattern";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagPattern = (): void =>
  _test_validateEquals<CommentTagPattern>({
    ...typia.json.schema<CommentTagPattern>(),
    factory: CommentTagPattern,
    name: "CommentTagPattern",
  });
