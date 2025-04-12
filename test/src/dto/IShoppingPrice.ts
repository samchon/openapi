import { tags } from "typia";

/**
 * Shopping price interface.
 *
 * @author Samchon
 */
export interface IShoppingPrice {
  /**
   * Nominal price.
   *
   * This is not {@link real real price} to pay, but just a nominal price to show.
   * If this value is greater than the {@link real real price}, it would be shown
   * like {@link IShoppingSeller seller} is giving a discount.
   */
  nominal: number & tags.Minimum<0>;

  /**
   * Real price to pay.
   */
  real: number & tags.Minimum<0>;
}
