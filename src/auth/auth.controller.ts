import { Controller, Request, Post, UseGuards, Body, Get, UsePipes, ValidationPipe, Response } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @UseGuards(AccessTokenGuard)
  @Get("logout")
  async logout(@Request() req) {
    await this.authService.logout(req.user.sub)
    return { success: true }
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req, @Response() res) {
    const tokens = await this.authService.login(req.user);
    return res.send({ success: true, tokens });
  }

  @Post("register")
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Response() res, @Body() registerUserDto: RegisterUserDto) {
    await this.authService.registerUser(registerUserDto)
    return res.send({ success: true })
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh")
  async refreshUserTokens(@Request() req, @Response() res) {
    const user = req.user;
    const tokens = await this.authService.refreshUserTokens(user.sub, user.refreshToken)
    return res.send({ success: true, tokens })
  }

  @UseGuards(AccessTokenGuard)
  @Get("profile")
  async getProfile(@Request() req) {
    const { id, firstName, lastName, email } = await this.userService.findOne(req.user.sub);
    return { id, firstName, lastName, email };
  }
}
