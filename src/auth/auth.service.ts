import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { hash, compare } from "../utils/cryptography.util";
import { LoginUserDto } from './dto/login.dto';
import { UserTypes } from 'src/schemas/user.schema';
import { responseHandler } from 'src/utils/responseHandling.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  public async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findByEmail(email);
      if (user) {
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

  public async logout(userId: string) {
    try {
      await this.userService.update(userId, { refreshToken: null })
      return responseHandler(true, { message: "Successfully logged out" })
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async login(user: LoginUserDto) {
    try {
      const { id, email, refreshToken } = await this.userService.findByEmail(user.email);
      if (refreshToken) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "User already logged in.",
        }, HttpStatus.CONFLICT)
      }

      const tokens = await this.getTokens(id, email);
      await this.updateRefreshToken(id, tokens.refreshToken)
      return responseHandler(true, { tokens });
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async loginAnonymousUser(id: string) {
    try {
      const tokens = await this.getTokens(id);
      await this.updateRefreshToken(id, tokens.refreshToken)
      return responseHandler(true, { tokens });
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async registerAnonymousUser() {
    try {
      const { id } = await this.userService.create({
        type: UserTypes.anonymous,
        refreshToken: null,
      });

      return await this.loginAnonymousUser(id);
    } catch (err) {
      console.error(err);
      return responseHandler(false, err);
    }
  }

  public async registerIdentifiedUser(userId: string, userData: RegisterUserDto) {
    try {
      const { password, ...rest } = userData;
      const existingUser = await this.userService.findByEmail(rest.email);

      if (existingUser) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Email already exists.",
        }, HttpStatus.CONFLICT);
      }

      const hashedPass = hash(password);
      await this.userService.update(userId, {
        ...rest,
        type: UserTypes.identified,
        password: hashedPass,
        refreshToken: null
      });

      return responseHandler(true, { message: "Successfully registered" });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async userProfile(userId: string) {
    try {
      const { id, firstName, lastName, email } = await this.userService.findOne(userId);
      const data = {
        user: {
          id,
          firstName,
          lastName,
          email
        }
      };
      return responseHandler(true, data)
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async isAdmin(userId: string) {
    try {
      const { isAdmin } = await this.userService.findOne(userId);
      return responseHandler(true, { isAdmin });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async refreshUserTokens(tokenUserId: string, paramUserId: string, refreshToken: string) {
    try {
      if (tokenUserId !== paramUserId) throw new ForbiddenException("Access Denied");
      
      const user = await this.userService.findOne(tokenUserId);
      if (!user || !user.refreshToken) throw new ForbiddenException("Access Denied");
      
      const isValidToken = compare(user.refreshToken, refreshToken);
      if (!isValidToken) throw new ForbiddenException("Access Denied");

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken)
      return responseHandler(true, { tokens });
    } catch (err) {
      return responseHandler(false, err)
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  logoutUsersOlderThanSevenDays() {
    this.logger.debug('Called every day');
  }

}
