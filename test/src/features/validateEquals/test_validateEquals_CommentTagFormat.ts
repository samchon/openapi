import typia from "typia";

import { CommentTagFormat } from "../../structures/CommentTagFormat";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagFormat = (): void =>
  _test_validateEquals<CommentTagFormat>({
    ...typia.json.schema<CommentTagFormat>(),
    factory: CommentTagFormat,
    name: "CommentTagFormat",
  });
