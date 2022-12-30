import { Controller, Request, Post, UseGuards, Body, Get, Param } from '@nestjs/common';
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
  public async logout(@Request() req: any) {
    return await this.authService.logout(req.user.sub);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  public async login(@Body() user: LoginUserDto) {
    return await this.authService.login(user);
  }

  @UseGuards(AccessTokenGuard)
  @Post("register")
  public async register(@Request() req: any, @Body() registerUserDto: RegisterUserDto) {
    return await this.authService.registerIdentifiedUser(req.user.sub, registerUserDto);
  }

  @Get("initial")
  public async initialRegister() {
    return await this.authService.registerAnonymousUser();
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh/:id")
  public async refreshUserTokens(@Request() req: any, @Param("id") id: string) {
    const { sub, refreshToken } = req.user;
    const result = await this.authService.refreshUserTokens(sub, id, refreshToken);
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Get("isAdmin")
  public async isAdminUser(@Request() req: any) {
    return await this.authService.isAdmin(req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Get("profile")
  public async getProfile(@Request() req: any) {
    return await this.authService.userProfile(req.user.sub);
  }
}
