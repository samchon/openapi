import {
  TypedBody,
  TypedFormData,
  TypedParam,
  TypedQuery,
  TypedRoute,
} from "@nestia/core";
import { Controller, Query } from "@nestjs/common";

@Controller()
export class AppController {
  @TypedRoute.Get(":a/:b/:c/parameters")
  public parameters(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
  ) {
    return { a, b, c };
  }

  @TypedRoute.Get(":a/:b/:c/query")
  public query(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @TypedQuery()
    query: {
      flag: boolean;
      value: number;
      text: string;
    },
  ) {
    return { a, b, c, query };
  }

  @TypedRoute.Post(":a/:b/:c/body")
  public body(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @TypedBody()
    body: {
      flag: boolean;
      value: number;
      text: string;
    },
  ) {
    return { a, b, c, body };
  }

  @TypedRoute.Post(":a/:b/:c/query/body")
  public query_body(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @Query("name") name: string,
    @Query("reference") reference: string,
    @TypedQuery()
    query: {
      memo: string;
    },
    @TypedBody()
    body: {
      flag: boolean;
      value: number;
      text: string;
    },
  ) {
    return {
      a,
      b,
      c,
      query: {
        ...query,
        name,
        reference,
      },
      body,
    };
  }

  @TypedRoute.Post(":a/:b/:c/multipart")
  public query_multipart(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @TypedQuery() query: { flag: boolean; value: number; text: string },
    @TypedFormData.Body()
    body: {
      name: string;
      reference: string;
      file: File;
    },
  ) {
    return {
      a,
      b,
      c,
      query,
      body: {
        name: body.name,
        reference: body.reference,
        file: `http://localhost:3000/files/${body.file.name}`,
      },
    };
  }
}
