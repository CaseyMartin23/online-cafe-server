import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { hash, compare } from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
      const { firstname, lastname, email, _id } = user;
      return { firstname, lastname, email, id: _id };
    }
    return null;
  }

  login(user: any) {
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      },
      { secret: this.configService.get("JWT_SECRET_KEY") }
    );
    return { token };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const saltRounds = Number(this.configService.get("BCRYPT_SALT_ROUNDS"));
    const { password, ...rest } = registerUserDto;
    const existingUser = await this.userService.findByEmail(rest.email)

    if (!existingUser) {
      const hashedPass = await hash(password, saltRounds);
      const { firstname, lastname, email } = await this.userService.create({ ...rest, password: hashedPass });
      return { firstname, lastname, email };
    }

    throw new HttpException({
      status: HttpStatus.CONFLICT,
      error: "Email already used!",
    }, HttpStatus.CONFLICT)
  }
}
