import typia from "typia";

import { CommentTagAtomicUnion } from "../../structures/CommentTagAtomicUnion";
import { _test_validate } from "../internal/_test_validate";

export const test_validate_CommentTagAtomicUnion = (): void =>
  _test_validate<CommentTagAtomicUnion>({
    collection: typia.json.schemas<[CommentTagAtomicUnion]>(),
    factory: CommentTagAtomicUnion,
    name: "CommentTagAtomicUnion",
  });
