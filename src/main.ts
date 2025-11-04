import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as fs from 'fs';
import hbs from 'hbs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import methodOverride from 'method-override';
import { UserMiddleware } from './user.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const rootDir = process.cwd();
  const viewsPath = join(rootDir, 'src/views');
  const partialsPath = join(viewsPath, 'partials');
  const publicPath = join(rootDir, 'public');

  // Vues et templates
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');
  hbs.registerPartials(partialsPath);

  // Fichiers statiques
  app.useStaticAssets(publicPath);

  // Middleware
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'super-secret-key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/nest',
        ttl: 24 * 60 * 60,
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
      },
    }),
  );

  app.use(new UserMiddleware().use);
  app.use(methodOverride('_method'));
  app.use(passport.initialize());
  app.use(passport.session());

  // Partials HBS dynamiques
  const partialsDir = join(__dirname, '..', 'src/views/partials');
  if (fs.existsSync(partialsDir)) {
    fs.readdirSync(partialsDir).forEach(file => {
      if (file.endsWith('.hbs')) {
        const name = file.replace('.hbs', '');
        const template = fs.readFileSync(join(partialsDir, file), 'utf8');
        hbs.handlebars.registerPartial(name, template);
      }
    });
  }

  // Helpers HBS
  hbs.handlebars.registerHelper('ifCond', function (v1: any, v2: any, options: any) {
    return v1 == v2 ? options.fn(this) : options.inverse(this);
  });

  hbs.handlebars.registerHelper('formatDate', function (date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} | ${hours}:${minutes} GMT`;
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on port ${port}`);
}

bootstrap();
