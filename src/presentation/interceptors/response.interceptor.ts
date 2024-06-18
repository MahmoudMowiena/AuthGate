import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        return {
          statusCode,
          message: this.getMessage(statusCode, context),
          data,
        };
      }),
    );
  }

  private getMessage(statusCode: number, context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    switch (method) {
      case 'POST':
        return statusCode === 200 || 201
          ? 'successfully completed'
          : 'Error creating resource';
      case 'PUT':
      case 'PATCH':
        return statusCode === 200 || 201
          ? 'Resource updated successfully'
          : 'Error updating resource';
      case 'DELETE':
        return statusCode === 200 || 201
          ? 'Resource deleted successfully'
          : 'Error deleting resource';
      default:
        return 'Request completed successfully';
    }
  }
}
