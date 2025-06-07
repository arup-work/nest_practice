import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgetPasswordDto } from "./dto/forgetPassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService){}

    @Post('register')
    async register(@Body() dto: RegisterDto){
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto){
        return this.authService.login(dto);
    }

    @Post('forget-password')
    async forgetPassword(@Body() dto: ForgetPasswordDto){
        return this.authService.requestPasswordReset(dto.email);
    }

    @Get('validate-reset-token')
    async validateResetToken(@Query('token') token: string){
        return this.authService.validateResetToken(token);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto){
        return this.authService.passwordReset(dto.token, dto.password);
    }

}