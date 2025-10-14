import typia from "typia";

import { CommentTagArray } from "../../structures/CommentTagArray";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagArray = (): void =>
  _test_validateEquals<CommentTagArray>({
    ...typia.json.schema<CommentTagArray>(),
    factory: CommentTagArray,
    name: "CommentTagArray",
  });
