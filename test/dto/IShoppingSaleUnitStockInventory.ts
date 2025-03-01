import { tags } from "typia";

/**
 * Inventory information of a final stock.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnitStockInventory {
  /**
   * Total income quantity.
   */
  income: number & tags.Type<"uint32">;

  /**
   * Total outcome quantity.
   */
  outcome: number & tags.Type<"uint32">;
}
