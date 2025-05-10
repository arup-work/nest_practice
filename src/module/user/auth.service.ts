import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) //It tells NestJS to inject the TypeORM repository for the User entity.
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
        name: user.firstName + ' ' + user.lastName,
      },
    };
  }
}
