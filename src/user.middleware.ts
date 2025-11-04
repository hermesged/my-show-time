import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class UserMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        res.locals.user = req.session.user || null;
        next();
    }
}