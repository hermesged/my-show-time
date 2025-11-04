import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  async register(data) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({ ...data, password: hashedPassword });

    const payload = { email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    const verificationLink = `${process.env.APP_URL}/auth/verify?token=${token}`;

    await this.mailService.sendMail(
      user.email,
      'Welcome',
      `Bonjour ${user.name}, votre compte a été créé avec succès.`,
      `<h1>Bienvenue ${user.name}</h1><p>Merci de t’être inscrit. Clique sur le lien ci-dessous pour vérifier ton adresse :</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>Ce lien expire dans 24h.</p>`,
    );
    return { message: 'User created successfully', user };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please check your email before logging in',
      );
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      access_token: token,
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) throw new Error('User not found');
      if (user.isVerified) return { message: 'Email already verified' };

      user.isVerified = true;
      await user.save();

      return { message: 'Email verified successfully' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
