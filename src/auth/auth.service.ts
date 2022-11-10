import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { hash, compare } from "../utils/passwordHashing.util";
import { LoginUserDto } from './dto/login.dto';
import { UserTypes } from 'src/schemas/user.schema';
import { responseHandler } from 'src/utils/responseHandling.util';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findByEmail(email);
      if(user) {
        const isMatch = compare(user.password, password);
        if (isMatch) {
          const { firstName, lastName, email, _id } = user;
          return { firstName, lastName, email, id: _id };
        }
      }
      
      return null;
    } catch (err) {
      console.error(err)
      return null;
    }
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

  async login(user: LoginUserDto) {
    try {
      const { id, email, refreshToken } = await this.userService.findByEmail(user.email);
      if (refreshToken) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Already loggedin!",
        }, HttpStatus.CONFLICT)
      }

      const tokens = await this.getTokens(id, email);
      await this.updateRefreshToken(id, tokens.refreshToken)
      return responseHandler(true, tokens);
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async loginAnonymousUser(id: string) {
    try {
      const tokens = await this.getTokens(id);
      await this.updateRefreshToken(id, tokens.refreshToken)
      return { success: true, tokens };
    } catch (err) {
      console.error(err)
      const { status, error } = err.response;
      return {
        success: false,
        statusCode: status,
        message: error
      }
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    if(registerUserDto.type === UserTypes.anonymous) {
      return await this.registerAnonymousUser(registerUserDto);
    }
    return await this.registerIdentifiedUser(registerUserDto);
  }

  private async registerAnonymousUser(userData: RegisterUserDto) {
    try {
      const { id } = await this.userService.create({
        ...userData,
        type: UserTypes.anonymous,
        refreshToken: null,
      });
      
      return await this.loginAnonymousUser(id);
    } catch (err) {
      console.error(err);
      return { success: false, error: err };
    }
  }

  private async registerIdentifiedUser(userData: RegisterUserDto) {
    try {
      const { password, ...rest } = userData;
      const existingUser = await this.userService.findByEmail(rest.email);

      if (existingUser) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Email already exists!",
        }, HttpStatus.CONFLICT);
      }

      const hashedPass = hash(password);
      await this.userService.create({
        ...rest,
        type: UserTypes.identified,
        password: hashedPass,
        refreshToken: null
      });

      return { success: true };
    } catch (err) {
      console.error(err);
      const errorResponse = err.response;
      return {
        success: false,
        statusCode: errorResponse.status,
        message: errorResponse.error
      };
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

      const isValidToken = compare(user.refreshToken, refreshToken);
      if (!isValidToken) throw new ForbiddenException("Access Denied");

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken)
      return { success: true, tokens };
    } catch (err) {
      console.error(err)
      return { success: false }
    }
  }

  private async getTokens(userId: string, email?: string) {
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

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = hash(refreshToken);
    await this.userService.update(userId, { refreshToken: hashedToken });
  }

}
