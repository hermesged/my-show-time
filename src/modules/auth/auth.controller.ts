import {
  Controller,
  Post,
  Get,
  Body,
  Render,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
// import express from 'express';
import type { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// @UseGuards(AuthGuard, RolesGuard)
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Get('register')
  @Render('auth/register')
  showRegister() {
    return {};
  }

  @Get('login')
  @Render('auth/login')
  showLogin(@Req() req: Request) {
    console.log('Session:', req.session);
    if (req.session.message) {
      const message = req.session.message;
      delete req.session.message;
      return { message };
    }
  }
  @Post('api/register')
  registerApi(@Body() CreateAuthDto: CreateAuthDto) {
    return this.authService.register(CreateAuthDto);
  }

  @Post('register')
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const dto = plainToInstance(CreateAuthDto, createAuthDto);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap((err) =>
        Object.values(err.constraints || {}),
      );

      return res.render('auth/register', {
        error: errorMessages,
        data: createAuthDto,
      });
    }
    try {
      await this.authService.register(createAuthDto);
      req.session.message = 'Registration successful! Please log in.';
      return res.redirect('/auth/login');
    } catch (error) {
      return res.render('auth/register', { error: error.message });
    }
  }

  @Post('login')
  async login(@Body() body, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.authService.login(body.email, body.password);
      req.session.user = user;

      console.log('Session après login:', req.session);

      return res.redirect('/');
    } catch (err) {
      return res.render('auth/login', { error: err.message });
    }
  }

  @Get('verify')
  async verifyEmail(
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.verifyEmail(token);
      req.session.message = result.message;
      return res.redirect('/auth/login');
    } catch (error) {
      return res.render('auth/login', { error: error.message });
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Disconnect error :', err);
        return res.status(500).send('Disconnect error');
      }
      res.clearCookie('connect.sid');
      return res.redirect('/auth/login');
    });
  }
}
