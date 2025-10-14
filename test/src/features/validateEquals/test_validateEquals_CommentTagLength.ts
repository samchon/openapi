import typia from "typia";

import { CommentTagLength } from "../../structures/CommentTagLength";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagLength = (): void =>
  _test_validateEquals<CommentTagLength>({
    ...typia.json.schema<CommentTagLength>(),
    factory: CommentTagLength,
    name: "CommentTagLength",
  });
