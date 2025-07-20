import typia from "typia";

import { CommentTagAtomicUnion } from "../../structures/CommentTagAtomicUnion";
import { _test_validateEquals } from "../internal/_test_validateEquals";

export const test_validateEquals_CommentTagAtomicUnion = (): void =>
  _test_validateEquals<CommentTagAtomicUnion>({
    ...typia.json.schema<CommentTagAtomicUnion>(),
    factory: CommentTagAtomicUnion,
    name: "CommentTagAtomicUnion",
  });
