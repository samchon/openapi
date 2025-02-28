import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagDefault } from "../../structures/CommentTagDefault";

export const test_validate_CommentTagDefault = (): void =>
  _test_validate<CommentTagDefault>({
    collection: typia.json.schemas<[CommentTagDefault]>(),
    factory: CommentTagDefault,
    name: "CommentTagDefault",
  });
