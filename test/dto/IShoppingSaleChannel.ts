import { IShoppingChannel } from "./IShoppingChannel";
import { IShoppingChannelCategory } from "./IShoppingChannelCategory";

/**
 * Target channel (and categories) of sale to sell.
 *
 * `IShoppingSaleChannel` is an entity that expresses through which
 * {@link IShoppingChannel channel} a listing {@link IShoppingSale} is sold.
 *
 * Also, if {@link IShoppingChannelCategory categories} are specified, it also
 * means that the sale be sold. Otherwise, none of the categories of the channel
 * being specified, it means that every categories of the channel is listing the
 * target sale.
 *
 * @author Samchon
 */
export interface IShoppingSaleChannel extends IShoppingChannel {
  /**
   * List of categories of the channel listing the sale.
   *
   * If empty, it means all categories of the channel is listing the sale.
   */
  categories: IShoppingChannelCategory.IInvert[];
}
export namespace IShoppingSaleChannel {
  /**
   * Creation information of the target channel (and categories) of sale to sell.
   */
  export interface ICreate {
    /**
     * Target channel's {@link IShoppingChannel.code}.
     */
    code: string;

    /**
     * List of target categories' {@link IShoppingChannelCategory.code}s.
     *
     * If empty, it means all categories of the channel is listing the sale.
     */
    category_codes: string[];
  }
}
