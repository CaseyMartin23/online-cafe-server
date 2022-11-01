import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async logout(userId: string) {
    try {
      await this.userService.update(userId, { refreshToken: null })
      return { success: true }
    } catch (err) {
      console.error(err);
      return { success: false }
    }
  }

  async login(user: any) {
    const { id, email } = user;
    try {
      const { refreshToken } = await this.userService.findOne(id);
      if (refreshToken) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Already loggedin!",
        }, HttpStatus.CONFLICT)
      }

      const tokens = await this.getTokens(id, email);
      await this.updateRefreshToken(id, tokens.refreshToken)
      return { success: true, tokens };
    } catch (err) {
      console.error(err)
      const errorResponse = err.response;
      return {
        success: false,
        statusCode: errorResponse.status,
        message: errorResponse.error
      }
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { password, ...rest } = registerUserDto;
      const existingUser = await this.userService.findByEmail(rest.email)

      if (existingUser) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Email already used!",
        }, HttpStatus.CONFLICT)
      }

      const hashedPass = await this.hashData(password);
      await this.userService.create({
        ...rest,
        password: hashedPass,
        refreshToken: null
      });

      return { success: true }
    } catch (err) {
      console.error(err);
      const errorResponse = err.response;
      return {
        success: false,
        statusCode: errorResponse.status,
        message: errorResponse.error
      }
    }
  }

  async userProfile(userId: string) {
    try {
      const { id, firstName, lastName, email } = await this.userService.findOne(userId);
      return { success: true, user: { id, firstName, lastName, email } }
    } catch (err) {
      console.error(err)
      return { success: false }
    }
  }

  async isAdmin(userId: string) {
    try {
      const { isAdmin } = await this.userService.findOne(userId);
      return { success: true, isAdmin };
    } catch (err) {
      console.error(err);
      return { success: false }
    }
  }

  async refreshUserTokens(userId: string, refreshToken: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user || !user.refreshToken) throw new ForbiddenException("Access Denied");

      const isValidToken = await compare(refreshToken, user.refreshToken);
      if (!isValidToken) throw new ForbiddenException("Access Denied");

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken)
      return { success: true, tokens };
    } catch (err) {
      console.error(err)
      return { success: false }
    }
  }

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get("ACCESS_TOKEN_SECRET"),
          expiresIn: this.configService.get("ACCESS_TOKEN_EXPIRATION"),
        }
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get("REFRESH_TOKEN_SECRET"),
          expiresIn: this.configService.get("REFRESH_TOKEN_EXPIRATION")
        }
      ),
    ])

    return { accessToken, refreshToken }
  }

  private async hashData(data: string) {
    const saltRounds = Number(this.configService.get("BCRYPT_SALT_ROUNDS"));
    return await hash(data, saltRounds);
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await this.hashData(refreshToken);
    await this.userService.update(userId, { refreshToken: hashedToken });
  }

}
