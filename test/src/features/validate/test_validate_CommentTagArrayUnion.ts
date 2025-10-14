import typia from "typia";

import { CommentTagArrayUnion } from "../../structures/CommentTagArrayUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagArrayUnion = (): void =>
  _test_validate<CommentTagArrayUnion>({
    ...typia.json.schema<CommentTagArrayUnion>(),
    factory: CommentTagArrayUnion,
    name: "CommentTagArrayUnion",
  });
