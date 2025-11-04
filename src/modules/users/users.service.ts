import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      user.email = updateUserDto.email;
      user.isVerified = false;
      await user.save();

    const verificationLink = `${process.env.APP_URL}/auth/verify?token=${user._id}`;
    await this.mailService.sendMail(
      user.email,
      'Verify your new email',
      `Please verify your new email by clicking this link: ${verificationLink}`,
      `<p>Click <a href="${verificationLink}">here</a> to verify your new email address.</p>`,
    );


      throw new BadRequestException(
        'Your email has been updated. Please verify your new email and log in again.',
      );
    }

    if (
      (updateUserDto as any).current_password &&
      (updateUserDto as any).new_password &&
      (updateUserDto as any).confirm_password
    ) {
      const { current_password, new_password, confirm_password } =
        updateUserDto as any;

      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect current password');
      }

      if (new_password !== confirm_password) {
        throw new BadRequestException('New passwords do not match');
      }

      user.password = await bcrypt.hash(new_password, 10);
      await user.save();

      return user.toObject({ versionKey: false });
    }

    Object.assign(user, updateUserDto);
    await user.save();

    return user.toObject({ versionKey: false });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`User with id ${id} not found`);
    return { deleted: true };
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Incorrect current password');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return { message: 'Password updated successfully' };
  }
}
