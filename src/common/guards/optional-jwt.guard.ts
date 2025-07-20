import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    // If user is present and token is valid, return user
    // If no user (i.e., token not provided), return null (don’t throw an error)
    return user || null;
  }
}
