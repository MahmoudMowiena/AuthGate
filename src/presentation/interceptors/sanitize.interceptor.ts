import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.sanitizeResponse(data)));
  }

  private sanitizeResponse(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.removeSensitiveFields(item));
    }
    return this.removeSensitiveFields(data);
  }

  private removeSensitiveFields(obj: any): any {
    if (obj && typeof obj === 'object') {
      const sanitizedObj = obj._doc ? { ...obj._doc } : { ...obj };
      delete sanitizedObj.password;
      delete sanitizedObj.confirmPassword;
      return sanitizedObj;
    }
    return obj;
  }
}
