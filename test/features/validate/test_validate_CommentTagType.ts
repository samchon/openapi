import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagType } from "../../structures/CommentTagType";

export const test_validate_CommentTagType = (): void =>
  _test_validate<CommentTagType>({
    collection: typia.json.schemas<[CommentTagType]>(),
    factory: CommentTagType,
    name: "CommentTagType",
  });
