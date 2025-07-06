import { OpenApiValidator } from "@samchon/openapi/lib/utils/OpenApiValidator";
import typia, { IJsonSchemaUnit, IValidation } from "typia";

const unit: IJsonSchemaUnit = typia.json.schema<ICat | IAnt>();
const result: IValidation<unknown> = OpenApiValidator.validate({
  ...unit,
  required: true,
  value: {
    type: "something",
    name: "unknown",
    ribbon: true,
  },
});
console.log(result);

interface ICat {
  type: "cat";
  name: string;
  ribbon: boolean;
}
interface IAnt {
  type: "ant";
  name: string;
  role: "queen" | "soldier" | "worker";
}

console.log(
  typia.validate<ICat | IAnt>({
    type: "something",
    name: "unknown",
    ribbon: true,
  }),
);
