import typia from "typia";

import { CommentTagArrayUnion } from "../../structures/CommentTagArrayUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagArrayUnion = (): void =>
  _test_validateEquals<CommentTagArrayUnion>({
    ...typia.json.schema<CommentTagArrayUnion>(),
    factory: CommentTagArrayUnion,
    name: "CommentTagArrayUnion",
  });
