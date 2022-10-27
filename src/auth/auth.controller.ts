import { Controller, Request, Post, UseGuards, Body, Get, UsePipes, ValidationPipe, Response } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) { }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  login(@Request() req, @Response() res) {
    const authedUser = this.authService.login(req.user);
    res.cookie("accessToken", authedUser.token, {
      maxAge: Number(this.configService.get("JWT_TOKEN_EXPIRATION")),
      httpOnly: true,
      sameSite: "strict"
    })
    return res.send({ userId: authedUser.userId });
  }

  @Post("register")
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.registerUser(registerUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
