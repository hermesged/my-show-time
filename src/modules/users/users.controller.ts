import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Render,
  Req,
  Res,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// Début des middleware de verif
import type { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
// Fin
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @Get('create')
  @UseGuards(AdminGuard)
  @Render('admin/users-create')
  createForm() {
    return {};
  }

  @Post()
  createAPI(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Post('admin')
  @UseGuards(AdminGuard)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    createUserDto.isVerified = true;
    await this.usersService.create(createUserDto);
    return res.redirect('/users');
  }


  @Get('profile')
  @UseGuards(AuthGuard)
  @Render('auth/profile')
  async profile(@Req() req: Request) {
    let errorMessages: string[] | undefined;

    if (req.session.errorMessages) {
      errorMessages = req.session.errorMessages;
      delete req.session.errorMessages;
    }

    const userSession = req.session?.user;
    const user = await this.usersService.findOne(userSession.id);

    return {
      user,
      error: errorMessages,
    };
  }

    @Post('update-password')
    @UseGuards(AuthGuard)
    async updatePassword(@Req() req: Request, @Res() res: Response) {
      const { oldPassword, newPassword } = req.body;
      const userId = req.session.user.id;

      try {
        await this.usersService.updatePassword(userId, oldPassword, newPassword);
        req.session.message = 'Password updated successfully!';
        return res.redirect('/users/profile');
      } catch (error) {
        req.session.errorMessages = [error.message || 'Failed to update password'];
        return res.redirect('/users/profile');
      }
    }



  @Get('api/')
  // @Roles('user')
  findAllAPI() {
    return this.usersService.findAll();
  }

   @Get()
  @UseGuards(AdminGuard)
  @Render('admin/users')
  async findAll(@Req() req: Request) {
    let message: string | null = null;
    let errors: string[] | null = null;

    if (req.session.message) {
      message = req.session.message;
      delete req.session.message;
    }
    if (req.session.errorMessages) {
      errors = req.session.errorMessages;
      delete req.session.errorMessages;
    }

    const users = await this.usersService.findAll();
    const currentAdmin = req.session?.user;
    return { users, message, errors, currentAdmin };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
async update(
  @Param('id') id: string,
  @Body() updateUserDto: UpdateUserDto,
  @Req() req: Request,
  @Res() res: Response,
) {
  try {
    await this.usersService.update(id, updateUserDto);

    req.session.message = 'Profile updated successfully';
    return res.redirect('/users/profile');
  } catch (err) {
    console.error(err);

    if (
      err.message.includes('verify your new email') ||
      err.message.includes('Email updated')
    ) {
      req.session.destroy(() => {
        res.redirect('/auth/login');
      });
      return;
    }

    req.session.errorMessages = [err.message];
    return res.redirect('/users/profile');
  }
}


  @Get('edit/:id')
@UseGuards(AdminGuard)
@Render('admin/users-edit')
async editForm(@Param('id') id: string, @Req() req: Request) {
  let errors: string[] | null = null;
  let message: string | null = null;

  if (req.session.errorMessages) {
    errors = req.session.errorMessages;
    delete req.session.errorMessages;
  }
  if (req.session.message) {
    message = req.session.message;
    delete req.session.message;
  }

  const user = await this.usersService.findOne(id);
  const currentAdmin = req.session?.user;

  return { user, errors, message, currentAdmin };
}


  @Post(':id')
@UseGuards(AdminGuard)
async updateFromForm(
  @Param('id') id: string,
  @Body() updateUserDto: UpdateUserDto,
  @Req() req: Request,
  @Res() res: Response
) {
  try {
    await this.usersService.update(id, updateUserDto);
    req.session.message = 'User updated successfully';
    return res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.session.errorMessages = [err.message || 'Update failed'];
    return res.redirect(`/users/edit/${id}`);
  }
}


  @Post('admin/:id/delete')
@UseGuards(AdminGuard)
async removeFromForm(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
  try {
    const user = await this.usersService.findOne(id);
    if (!user) {
      req.session.errorMessages = ['User not found'];
      return res.redirect('/users');
    }

    if (user.role === 'admin') {
      req.session.errorMessages = ['Cannot delete an admin'];
      return res.redirect('/users');
    }

    if (req.session.user && req.session.user._id === id) {
      req.session.errorMessages = ['Cannot delete yourself'];
      return res.redirect('/users');
    }

    await this.usersService.remove(id);
    req.session.message = 'User deleted successfully';
    return res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.session.errorMessages = ['Error while deleting the user'];
    return res.redirect('/users');
  }
}

//Pour appi
   @Delete('admin/:id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.usersService.findOne(id);

      if (!user) {
        req.session.errorMessages = ['User not found'];
        return res.redirect('/users');
      }

      if (user.role === 'admin') {
        req.session.errorMessages = ['Unable to delete an administrator'];
        return res.redirect('/users');
      }

      if (req.session.user && req.session.user._id === id) {
        req.session.errorMessages = ['You cannot delete yourself'];
        return res.redirect('/users');
      }

      await this.usersService.remove(id);
      req.session.message = 'User deleted successfully';
      return res.redirect('/users');
    } catch (err) {
      console.error(err);
      req.session.errorMessages = ['Error while deleting the user'];
      return res.redirect('/users');
    }
  }
  
}
