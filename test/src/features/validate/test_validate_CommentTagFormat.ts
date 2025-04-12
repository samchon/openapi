import typia from "typia";

import { CommentTagFormat } from "../../structures/CommentTagFormat";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagFormat = (): void =>
  _test_validate<CommentTagFormat>({
    collection: typia.json.schemas<[CommentTagFormat]>(),
    factory: CommentTagFormat,
    name: "CommentTagFormat",
  });
