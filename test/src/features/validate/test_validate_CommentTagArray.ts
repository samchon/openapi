import typia from "typia";

import { CommentTagArray } from "../../structures/CommentTagArray";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagArray = (): void =>
  _test_validate<CommentTagArray>({
    collection: typia.json.schemas<[CommentTagArray]>(),
    factory: CommentTagArray,
    name: "CommentTagArray",
  });
