import { IShoppingSaleUnitDescriptiveOption } from "./IShoppingSaleUnitDescriptiveOption";
import { IShoppingSaleUnitSelectableOption } from "./IShoppingSaleUnitSelectableOption";

/**
 * Individual option information on units for sale.
 *
 * `IShoppingSaleUnitOption` is a subsidiary entity of
 * {@link IShoppingSaleUnit} that represents individual products in the
 * {@link IShoppingSale sale}, and is an entity designed to represent individual
 * option information for the unit.
 *
 * Also, `IShoppingSaleUnitOption` is an union type of two entities,
 * {@link IShoppingSaleUnitSelectableOption} and
 * {@link IShoppingSaleUnitDescriptiveOption}. To specify the detailed type of
 * them, just use the `if` statement to the {@link type} property like below:
 *
 * ```typescript
 * if (option.type === "select")
 *     option.candidates; // IShoppingSaleUnitSelectableOption
 * ```
 *
 * - Examples of Options
 *   - selectable options
 *     - Computer: CPU, RAM, SSD, etc.
 *     - Clothes: size, color, style, etc.
 *   - descriptive options
 *     - Engrave
 *     - Simple question
 *
 * If the type of option is a variable value in "select", the final stock that the
 * {@link IShoppingCustomer customer} will purchase changes depending on the
 * selection of the {@link IShoppingSaleUnitOptionCandidate candidate value}.
 *
 * Conversely, if it is a type other than "select", or if the type is "select" but
 * variable is false, this is an option that has no meaning beyond simple information
 * transfer. Therefore, no matter what value the customer enters and chooses when
 * purchasing it, the option in this case does not affect the
 * {@link IShoppingSaleUnitStock final stock}.
 *
 * @author Samchon
 */
export type IShoppingSaleUnitOption =
  | IShoppingSaleUnitSelectableOption
  | IShoppingSaleUnitDescriptiveOption;
export namespace IShoppingSaleUnitOption {
  /**
   * Inversely referenced information of the option.
   */
  export type IInvert =
    | IShoppingSaleUnitSelectableOption.IInvert
    | IShoppingSaleUnitDescriptiveOption;

  /**
   * Creation information of the option.
   */
  export type ICreate = IShoppingSaleUnitSelectableOption.ICreate;
  // | IShoppingSaleUnitDescriptiveOption.ICreate;
}
