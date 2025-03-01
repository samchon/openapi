import { tags } from "typia";

import { IShoppingSaleUnitOption } from "./IShoppingSaleUnitOption";
import { IShoppingSaleUnitOptionCandidate } from "./IShoppingSaleUnitOptionCandidate";

/**
 * Selection information of final stock.
 *
 * `IShoppingSaleUnitStockChoice` is an entity that represents which
 * {@link IShoppingSaleUnitSelectableOption option} of each variable "select"
 * type was selected for each {@link IShoppingSaleUnitStock stock} and which
 * {@link IShoppingSaleUnitOptionCandidate candidate value} was selected within
 * it.
 *
 * Of course, if the bound {@link IShoppingSaleUnit unit} does not have any
 * options, this entity can also be ignored.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnitStockChoice {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Target option's {@link IShoppingSaleUnitOption.id}
   */
  option_id: string & tags.Format<"uuid">;

  /**
   * Target candidate's {@link IShoppingSaleUnitOptionCandidate.id}
   */
  candidate_id: string & tags.Format<"uuid">;
}

export namespace IShoppingSaleUnitStockChoice {
  /**
   * Invert information from the cart.
   */
  export interface IInvert {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Target option.
     */
    option: IShoppingSaleUnitOption.IInvert;

    /**
     * Selected candidate value.
     */
    candidate: IShoppingSaleUnitOptionCandidate | null;

    /**
     * Written value.
     */
    value: boolean | number | string | null;
  }

  /**
   * Creation information of stock choice.
   */
  export interface ICreate {
    /**
     * Target option's index number in
     * {@link IShoppingSaleUnit.ICreate.options}.
     */
    option_index: number & tags.Type<"uint32">;

    /**
     * Target candidate's index number in
     * {@link IShoppingSaleUnitSelectableOption.ICreate.candidates}.
     */
    candidate_index: number & tags.Type<"uint32">;
  }
}
