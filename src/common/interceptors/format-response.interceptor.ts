import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((originalResponse) => {
        // If response is already in expected format, return as-is
        if (
          typeof originalResponse === 'object' &&
          'error' in originalResponse &&
          'status' in originalResponse
        ) {
          return originalResponse;
        }
        console.log(originalResponse)
        const response: any = {
          error: 0,
          status: 'success'
        };

        if (originalResponse?.message) {
          response.message = originalResponse.message;
        }

        if (originalResponse?.data !== undefined) {
          response.data = originalResponse.data;
        }
        console.log(response)
        return response;
      })
    );
  }
}
