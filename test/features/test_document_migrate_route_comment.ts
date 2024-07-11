import { TestValidator } from "@nestia/e2e";
import { IMigrateDocument, IMigrateRoute, OpenApi } from "@samchon/openapi";
import fs from "fs";

export const test_document_migrate_route_comment = async (): Promise<void> => {
  const swagger: OpenApi.IDocument = OpenApi.convert(
    JSON.parse(
      await fs.promises.readFile(
        `${__dirname}/../../../examples/v3.1/shopping.json`,
        "utf8",
      ),
    ),
  );
  const migrate: IMigrateDocument = OpenApi.migrate(swagger);
  const route: IMigrateRoute | undefined = migrate.routes.find(
    (r) => r.path === "/shoppings/sellers/sales/{id}" && r.method === "put",
  );
  TestValidator.equals("comment")(route?.comment())(EXPECTED);
};

const EXPECTED = `Update a sale.

Update a {@link IShoppingSale sale} with new information.

By the way, the sale actually does not being modified, but just make a new
{@link IShoppingSaleSnapshot snapshot} record of the sale. Its 1st purpose
is to keeping the integrity of the sale, due to modification of the sale
must not affect to the {@link IShoppingOrder orders} that already had been
applied to the sale.

The 2nd purpose is for the A/B tests. {@link IShoppingSeller Seller} needs
to demonstrate operating performance by chaning price, content, and
composition of the product. This snapshot concept would be helpful for it.

@param id Target sale's ID to update.
          Note that, you have to specify only the sale ID of your own.
@param body New information of the sale.
            Note that, your input data would entirely modify the sale, so that have to be careful if you only want the partial updating.
@tag Sale`
  .split("\r\n")
  .join("\n");
