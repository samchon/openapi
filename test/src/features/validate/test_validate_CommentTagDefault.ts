import typia from "typia";

import { CommentTagDefault } from "../../structures/CommentTagDefault";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagDefault = (): void =>
  _test_validate<CommentTagDefault>({
    ...typia.json.schema<CommentTagDefault>(),
    factory: CommentTagDefault,
    name: "CommentTagDefault",
  });
