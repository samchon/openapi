import { tags } from "typia";

import { IShoppingPrice } from "./IShoppingPrice";
import { IShoppingSaleUnitStockChoice } from "./IShoppingSaleUnitStockChoice";
import { IShoppingSaleUnitStockInventory } from "./IShoppingSaleUnitStockInventory";

/**
 * Final component information on units for sale.
 *
 * `IShoppingSaleUnitStock` is a subsidiary entity of {@link IShoppingSaleUnit}
 * that represents a product catalog for sale, and is a kind of final stock that is
 * constructed by selecting all {@link IShoppingSaleUnitSelectableOption options}
 * (variable "select" type) and their
 * {@link IShoppingSaleUnitOptionCandidate candidate} values in the belonging unit.
 * It is the "good" itself that customers actually purchase.
 *
 * - Product Name) MacBook
 *   - Options
 *     - CPU: { i3, i5, i7, i9 }
 *     - RAM: { 8GB, 16GB, 32GB, 64GB, 96GB }
 *     - SSD: { 256GB, 512GB, 1TB }
 *   - Number of final stocks: 4 * 5 * 3 = 60
 *
 * For reference, the total number of `IShoppingSaleUnitStock` records in an
 * attribution unit can be obtained using Cartesian Product. In other words, the
 * value obtained by multiplying all the candidate values that each
 * (variable "select" type) option can have by the number of cases is the total
 * number of final stocks in the unit.
 *
 * Of course, without a single variable "select" type option, the final stocks
 * count in the unit is only 1.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnitStock {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Representative name of the stock.
   */
  name: string;

  /**
   * Price of the stock.
   */
  price: IShoppingPrice;

  /**
   * Current inventory status of the stock.
   */
  inventory: IShoppingSaleUnitStockInventory;

  /**
   * List of choices.
   *
   * Which candidate values being chosen for each option.
   */
  choices: IShoppingSaleUnitStockChoice[];
}
export namespace IShoppingSaleUnitStock {
  /**
   * Invert information from the cart.
   */
  export interface IInvert {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Representative name of the stock.
     */
    name: string;

    /**
     * Price of the stock.
     */
    price: IShoppingPrice;

    /**
     * Quantity of the stock in the cart.
     */
    quantity: number & tags.Type<"uint32"> & tags.Minimum<1>;

    /**
     * Current inventory status of the stock.
     */
    inventory: IShoppingSaleUnitStockInventory;

    /**
     * List of choices.
     *
     * Which values being written for each option.
     */
    choices: IShoppingSaleUnitStockChoice.IInvert[];
  }

  /**
   * Creation information of the stock.
   */
  export interface ICreate {
    /**
     * Representative name of the stock.
     */
    name: string;

    /**
     * Price of the stock.
     */
    price: IShoppingPrice;

    /**
     * Initial inventory quantity.
     */
    quantity: number & tags.Type<"uint32"> & tags.Minimum<1>;

    /**
     * List of choices.
     *
     * Which candidate values being chosen for each option.
     */
    choices: IShoppingSaleUnitStockChoice.ICreate[];
  }
}
