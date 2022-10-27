import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { hash, compare } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && await compare(password, user.password)) {
      const { firstName, lastName, email, _id } = user;
      return { firstName, lastName, email, id: _id };
    }
    return null;
  }

  login(user: any) {
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      {
        secret: this.configService.get("JWT_SECRET_KEY"),
        expiresIn: this.configService.get("JWT_TOKEN_EXPIRATION")
      }
    );
    return { token, userId: user.id };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const saltRounds = Number(this.configService.get("BCRYPT_SALT_ROUNDS"));
    const { password, ...rest } = registerUserDto;
    const existingUser = await this.userService.findByEmail(rest.email)

    if (!existingUser) {
      const hashedPass = await hash(password, saltRounds);
      const { firstName, lastName, email } = await this.userService.create({ ...rest, password: hashedPass });
      return { firstName, lastName, email };
    }

    throw new HttpException({
      status: HttpStatus.CONFLICT,
      error: "Email already used!",
    }, HttpStatus.CONFLICT)
  }
}
