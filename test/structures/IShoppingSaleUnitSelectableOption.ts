import { tags } from "typia";

import { IShoppingSaleUnitOptionCandidate } from "./IShoppingSaleUnitOptionCandidate";

/**
 * Individual option information on units for sale.
 *
 * `IShoppingSaleUnitSelectableOption` is a subsidiary entity of
 * {@link IShoppingSaleUnit} that represents individual products in the
 * {@link IShoppingSale sale}, and is an entity designed to represent individual
 * selectable option information for the unit.
 *
 * - Examples of Options
 *   - selectable options
 *     - Computer: CPU, RAM, SSD, etc.
 *     - Clothes: size, color, style, etc.
 *   - descriptive options
 *     - Engrave
 *     - Simple question
 *
 * If the {@link variable} property value is `true`, the final stock that the
 * {@link IShoppingCustomer customer} will purchase changes depending on the
 * selection of the {@link IShoppingSaleUnitOptionCandidate candidate value}.
 *
 * Conversely, if it is a type other than "select", or if the {@link variable}
 * property value is "false", , this is an option that has no meaning beyond
 * simple information transfer. Therefore, no matter what value the customer
 * chooses when purchasing it, the option in this case does not affect the
 * {@link IShoppingSaleUnitStock final stock}.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnitSelectableOption
  extends IShoppingSaleUnitSelectableOption.IInvert {
  /**
   * List of candidate values.
   */
  candidates: IShoppingSaleUnitOptionCandidate[] & tags.MinItems<1>;
}
export namespace IShoppingSaleUnitSelectableOption {
  export interface IInvert {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Discriminant for the type of selectable option.
     */
    type: "select";

    /**
     * Represents the name of the option.
     */
    name: string;

    /**
     * Whether the option is variable or not.
     *
     * When type of current option is "select", this attribute means whether
     * selecting different candidate value affects the final stock or not.
     */
    variable: boolean;
  }

  /**
   * Creation information of the selectable option.
   */
  export interface ICreate {
    /**
     * Discriminant for the type of selectable option.
     */
    type: "select";

    /**
     * Represents the name of the option.
     */
    name: string;

    /**
     * Whether the option is variable or not.
     *
     * When type of current option is "select", this attribute means whether
     * selecting different candidate value affects the final stock or not.
     */
    variable: boolean;

    /**
     * List of candidate values.
     */
    candidates: IShoppingSaleUnitOptionCandidate.ICreate[] & tags.MinItems<1>;
  }
}
