import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { MailQueueService } from '../mail-queue/mail-queue.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) //It tells NestJS to inject the TypeORM repository for the User entity.
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private mailService: MailService,
    private mailQueueService: MailQueueService
  ) {}

  async register(dto: RegisterDto) {
    // Check if email is already exist or not
    const existingUser = await this.userRepository.findOneBy({
      email: dto.email,
    });
    if (existingUser) {
      throw new BadRequestException('Email is already taken');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // Save to the database
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    // Send a welcome email
    await this.mailQueueService.queueWelcomeEmail(dto.email,`${dto.firstName} ${dto.lastName}`)

    // Remove the password from the response
    const { password, id, ...userWithoutPassword } = savedUser;
    return {
      statusCode: 201,
      message: 'User registered successfully',
      data: { ...userWithoutPassword },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credential');
    }

    const isMatched = await bcrypt.compare(dto.password, user.password);
    if (!isMatched) {
      throw new UnauthorizedException('Invalid credential');
    }

    const payload = { sub: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload);
    return {
      message: 'Login successfully',
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async requestPasswordReset(email: string){
    const user = await this.userRepository.findOne({
      where: {
        email
      }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetTokenExpire = new Date(Date.now() + 3600000) //1 hour
    await this.userRepository.save(user);

    await this.mailQueueService.queueForgetPassword(email,token);
    return {
      message: 'A password reset link has been send your email address'
    }
  }

  async validateResetToken(token: string){
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetTokenExpire: MoreThan(new Date())
      }
    });

    if (!user) {
      return { valid: false}
    }

    return { valid: true}
  }

  async passwordReset(token: string, password: string){
      const user = await this.userRepository.findOne({
        where: {
          resetPasswordToken: token,
          resetTokenExpire: MoreThan(new Date())
        }
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired token')
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = null;
      user.resetTokenExpire = null;

      await this.userRepository.save(user);

      return {
        message: 'Password has been successfully reset'
      }
  }
}
