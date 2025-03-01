import { tags } from "typia";

import { IShoppingSalePriceRange } from "./IShoppingSalePriceRange";
import { IShoppingSaleUnitOption } from "./IShoppingSaleUnitOption";
import { IShoppingSaleUnitStock } from "./IShoppingSaleUnitStock";

/**
 * Product composition information handled in the sale.
 *
 * `IShoppingSaleUnit` is an entity that embodies the "individual product"
 * information handled in the {@link IShoppingSale sale}.
 *
 * For reference, the reason why `IShoppingSaleUnit` is separated from
 * {@link IShoppingSaleSnapshot} by an algebraic relationship of 1: N is because
 * there are some cases where multiple products are sold in one listing. This is
 * the case with so-called "bundled products".
 *
 * - Bundle from regular product (Mackbook Set)
 *   - Main Body
 *   - Keyboard
 *   - Mouse
 *   - Apple Care (Free A/S Voucher)
 *
 * And again, `IShoppingSaleUnit` does not in itself refer to the
 * {@link IShoppingSaleUnitStock final stock} that the
 * {@link IShoppingCustomer customer} will {@link IShoppingOrder purchase}.
 * The final stock can be found only after selecting all given
 * {@link IShoppingSaleUnitOption options} and their
 * {@link IShoppingSaleUnitOptionCandidate candidate values}.
 *
 * For example, even if you buy a Macbook, the final stocks are determined only
 * after selecting all the options (CPU / RAM / SSD), etc.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnit extends IShoppingSaleUnit.IBase {
  /**
   * List of options.
   */
  options: IShoppingSaleUnitOption[];

  /**
   * List of final stocks.
   */
  stocks: IShoppingSaleUnitStock[] & tags.MinItems<1>;
}
export namespace IShoppingSaleUnit {
  export interface IInvert extends IBase {
    /**
     * List of final stocks.
     */
    stocks: IShoppingSaleUnitStock.IInvert[] & tags.MinItems<1>;
  }

  export interface ISummary extends IBase {
    price_range: IShoppingSalePriceRange;
  }

  export interface IBase {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Representative name of the unit.
     */
    name: string;

    /**
     * Whether the unit is primary or not.
     *
     * Just a labeling value.
     */
    primary: boolean;

    /**
     * Whether the unit is required or not.
     *
     * When the unit is required, the customer must select the unit. If do not
     * select, customer can't buy it.
     *
     * For example, if there's a sale "Macbook Set" and one of the unit is the
     * "Main Body", is it possible to buy the "Macbook Set" without the
     * "Main Body" unit? This property is for that case.
     */
    required: boolean;
  }

  /**
   * Creation information of sale unit.
   */
  export interface ICreate extends Omit<IBase, "id"> {
    /**
     * List of options.
     */
    options: IShoppingSaleUnitOption.ICreate[];

    /**
     * List of final stocks.
     */
    stocks: IShoppingSaleUnitStock.ICreate[] & tags.MinItems<1>;
  }
}
