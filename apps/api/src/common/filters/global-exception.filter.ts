import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Every error leaves the API in one consistent shape, and internals
 * (stack traces, Prisma errors, SQL) never reach the client. 5xx causes
 * are logged server-side with full detail.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exceptions");

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let body: ErrorBody;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;
        body = {
          statusCode: status,
          code:
            typeof p.code === "string"
              ? p.code
              : HttpStatus[status] ?? "ERROR",
          message:
            typeof p.message === "string"
              ? p.message
              : Array.isArray(p.message)
                ? p.message.join("; ")
                : exception.message,
          ...(p.details !== undefined ? { details: p.details } : {}),
        };
      } else {
        body = {
          statusCode: status,
          code: HttpStatus[status] ?? "ERROR",
          message: String(payload),
        };
      }
    } else {
      const errName = (exception as Error)?.name ?? "";
      const errMessage = (exception as Error)?.message ?? String(exception);
      const isDbError =
        errName.includes("PrismaClient") ||
        errMessage.includes("Can't reach database server") ||
        errMessage.includes("DATABASE_URL");

      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );

      if (isDbError) {
        body = {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          code: "DATABASE_UNAVAILABLE",
          message:
            "Database connection failed. Please ensure DATABASE_URL environment variable is set in Vercel settings and PostgreSQL server is running.",
        };
      } else {
        body = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Please try again.",
        };
      }
    }

    response.status(body.statusCode).json(body);
  }
}
