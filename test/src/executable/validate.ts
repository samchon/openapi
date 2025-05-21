import { OpenApi, OpenApiTypeChecker } from "@samchon/openapi";
import { ClaudeSchemaComposer } from "@samchon/openapi/lib/composers/llm/ClaudeSchemaComposer";

const components: OpenApi.IComponents = {};
const schema: OpenApi.IJsonSchema = ClaudeSchemaComposer.invert({
  components,
  schema: {
    type: "array",
    items: {
      $ref: "#/$defs/marketplace-purchase",
    },
  },
  $defs: {
    "IApiMarketplaceListingPlansAccounts.GetQuery": {
      type: "object",
      properties: {},
      required: [],
    },
    "marketplace-purchase": {
      title: "Marketplace Purchase",
      description: "Marketplace Purchase",
      type: "object",
      properties: {
        url: {
          type: "string",
        },
        type: {
          type: "string",
        },
        id: {
          type: "integer",
        },
        login: {
          type: "string",
        },
        organization_billing_email: {
          type: "string",
        },
        email: {
          oneOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        marketplace_pending_change: {
          oneOf: [
            {
              type: "object",
              properties: {
                is_installed: {
                  type: "boolean",
                },
                effective_date: {
                  type: "string",
                },
                unit_count: {
                  oneOf: [
                    {
                      type: "integer",
                    },
                    {
                      type: "null",
                    },
                  ],
                },
                id: {
                  type: "integer",
                },
                plan: {
                  $ref: "#/$defs/marketplace-listing-plan",
                },
              },
              required: [],
            },
            {
              type: "null",
            },
          ],
        },
        marketplace_purchase: {
          type: "object",
          properties: {
            billing_cycle: {
              type: "string",
            },
            next_billing_date: {
              oneOf: [
                {
                  type: "string",
                },
                {
                  type: "null",
                },
              ],
            },
            is_installed: {
              type: "boolean",
            },
            unit_count: {
              oneOf: [
                {
                  type: "integer",
                },
                {
                  type: "null",
                },
              ],
            },
            on_free_trial: {
              type: "boolean",
            },
            free_trial_ends_on: {
              oneOf: [
                {
                  type: "string",
                },
                {
                  type: "null",
                },
              ],
            },
            updated_at: {
              type: "string",
            },
            plan: {
              $ref: "#/$defs/marketplace-listing-plan",
            },
          },
          required: [],
        },
      },
      required: ["url", "id", "type", "login", "marketplace_purchase"],
    },
    "marketplace-listing-plan": {
      title: "Marketplace Listing Plan",
      description: "Marketplace Listing Plan",
      type: "object",
      properties: {
        url: {
          example: "https://api.github.com/marketplace_listing/plans/1313",
          type: "string",
          format: "uri",
        },
        accounts_url: {
          example:
            "https://api.github.com/marketplace_listing/plans/1313/accounts",
          type: "string",
          format: "uri",
        },
        id: {
          example: 1313,
          type: "integer",
        },
        number: {
          example: 3,
          type: "integer",
        },
        name: {
          example: "Pro",
          type: "string",
        },
        description: {
          example: "A professional-grade CI solution",
          type: "string",
        },
        monthly_price_in_cents: {
          example: 1099,
          type: "integer",
        },
        yearly_price_in_cents: {
          example: 11870,
          type: "integer",
        },
        price_model: {
          example: "FLAT_RATE",
          oneOf: [
            {
              const: "FREE",
            },
            {
              const: "FLAT_RATE",
            },
            {
              const: "PER_UNIT",
            },
          ],
        },
        has_free_trial: {
          example: true,
          type: "boolean",
        },
        unit_name: {
          oneOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        state: {
          example: "published",
          type: "string",
        },
        bullets: {
          example: ["Up to 25 private repositories", "11 concurrent builds"],
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: [
        "url",
        "accounts_url",
        "id",
        "number",
        "name",
        "description",
        "has_free_trial",
        "price_model",
        "unit_name",
        "monthly_price_in_cents",
        "state",
        "yearly_price_in_cents",
        "bullets",
      ],
    },
  },
});

OpenApiTypeChecker.visit({
  components,
  schema,
  closure: (schema) => {
    if (OpenApiTypeChecker.isReference(schema)) {
      console.log(schema.$ref);
    }
  },
});
