import typia from "typia";

import { _test_validate } from "../internal/_test_validate";
import { CommentTagObjectUnion } from "../../structures/CommentTagObjectUnion";

export const test_validate_CommentTagObjectUnion = (): void =>
  _test_validate<CommentTagObjectUnion>({
    collection: typia.json.schemas<[CommentTagObjectUnion]>(),
    factory: CommentTagObjectUnion,
    name: "CommentTagObjectUnion",
  });
