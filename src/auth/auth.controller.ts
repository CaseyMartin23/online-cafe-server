import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(AccessTokenGuard)
  @Get("logout")
  async logout(@Request() req) {
    return await this.authService.logout(req.user.sub);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Body() user: LoginUserDto) {
    return await this.authService.login(user);
  }

  @UseGuards(AccessTokenGuard)
  @Post("register")
  async register(@Request() req, @Body() registerUserDto: RegisterUserDto) {
    return await this.authService.registerIdentifiedUser(req.user.sub, registerUserDto);
  }

  @Get("initial")
  async initialRegister() {
    return await this.authService.registerAnonymousUser();
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh")
  async refreshUserTokens(@Request() req) {
    const user = req.user;
    return await this.authService.refreshUserTokens(user.sub, user.refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get("isAdmin")
  async isAdminUser(@Request() req) {
    return await this.authService.isAdmin(req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Get("profile")
  async getProfile(@Request() req) {
    return await this.authService.userProfile(req.user.sub);
  }
}
