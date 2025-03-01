import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagFormat } from "../../structures/CommentTagFormat";

export const test_validate_CommentTagFormat = (): void =>
  _test_validate<CommentTagFormat>({
    collection: typia.json.schemas<[CommentTagFormat]>(),
    factory: CommentTagFormat,
    name: "CommentTagFormat",
  });
