import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class AppFilter extends BaseExceptionFilter {
  public async catch(exception: HttpException | Error, host: ArgumentsHost) {
    const status: number =
      exception instanceof HttpException ? exception.getStatus() : 500;
    if (status === 500) console.info(exception);
    return super.catch(exception, host);
  }
}
