import { ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class AppFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AppFilter.name);

  public async catch(exception: HttpException | Error, host: ArgumentsHost) {
    const status: number =
      exception instanceof HttpException ? exception.getStatus() : 500;
    if (status === 500) console.info(exception);
    return super.catch(exception, host);
  }
}
