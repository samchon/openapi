import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagArray } from "../../structures/CommentTagArray";

export const test_validate_CommentTagArray = (): void =>
  _test_validate<CommentTagArray>({
    collection: typia.json.schemas<[CommentTagArray]>(),
    factory: CommentTagArray,
    name: "CommentTagArray",
  });
