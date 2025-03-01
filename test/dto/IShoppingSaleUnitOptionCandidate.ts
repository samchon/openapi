import { tags } from "typia";

/**
 * Selectable candidate values within an option.
 *
 * `IShoppingSaleUnitOptionCandidate` is an entity that represents individual
 * candidate values that can be selected from
 * {@link IShoppingSaleUnitSelectableOption options of the "select" type}.
 *
 * - Example
 *   - RAM: 8GB, 16GB, 32GB
 *   - GPU: RTX 3060, RTX 4080, TESLA
 *   - License: Private, Commercial, Educatiion
 *
 * By the way, if belonged option is not "select" type, this entity never
 * being used.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnitOptionCandidate
  extends IShoppingSaleUnitOptionCandidate.ICreate {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;
}

export namespace IShoppingSaleUnitOptionCandidate {
  /**
   * Creation information of the candidate value.
   */
  export interface ICreate {
    /**
     * Represents the name of the candidate value.
     */
    name: string;
  }
}
