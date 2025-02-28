import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagRange } from "../../structures/CommentTagRange";

export const test_validate_CommentTagRange = (): void =>
  _test_validate<CommentTagRange>({
    collection: typia.json.schemas<[CommentTagRange]>(),
    factory: CommentTagRange,
    name: "CommentTagRange",
  });
