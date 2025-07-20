import typia from "typia";

import { CommentTagDefault } from "../../structures/CommentTagDefault";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagDefault = (): void =>
  _test_validateEquals<CommentTagDefault>({
    ...typia.json.schema<CommentTagDefault>(),
    factory: CommentTagDefault,
    name: "CommentTagDefault",
  });
