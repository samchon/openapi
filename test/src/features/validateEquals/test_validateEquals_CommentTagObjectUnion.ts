import typia from "typia";

import { CommentTagObjectUnion } from "../../structures/CommentTagObjectUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagObjectUnion = (): void =>
  _test_validateEquals<CommentTagObjectUnion>({
    ...typia.json.schema<CommentTagObjectUnion>(),
    factory: CommentTagObjectUnion,
    name: "CommentTagObjectUnion",
  });
