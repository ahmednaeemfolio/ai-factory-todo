import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthResult, AuthService } from './auth.service';

class CredentialsDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() credentials: CredentialsDto): AuthResult {
    return this.authService.register(credentials.username, credentials.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: CredentialsDto): AuthResult {
    return this.authService.login(credentials.username, credentials.password);
  }

  @Post('ghost')
  loginAsGhost(): AuthResult {
    return this.authService.loginAsGhost();
  }
}
