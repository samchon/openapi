import typia from "typia";

import { CommentTagObjectUnion } from "../../structures/CommentTagObjectUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagObjectUnion = (): void =>
  _test_validate<CommentTagObjectUnion>({
    collection: typia.json.schemas<[CommentTagObjectUnion]>(),
    factory: CommentTagObjectUnion,
    name: "CommentTagObjectUnion",
  });
