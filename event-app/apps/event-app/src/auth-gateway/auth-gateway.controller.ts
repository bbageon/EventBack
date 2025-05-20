// apps/event-app/src/auth-gateway/auth-gateway.controller.ts
import {
    Body,
    Controller,
    Post,
    HttpStatus,
    Logger, // Logger 사용
    Get,
    Req,
    Res,
    UseGuards,
    HttpCode,
    ValidationPipe,
    UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Service
import { AuthGatewayService } from './auth-gateway.service';

// Passport, Guard
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common';

// Swagger, Dto
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserSignInDto, UserSignUpDto, AdminSignInDto, AdminSignUpDto } from '@app/common/dto';
import { UserDto } from '@app/common/dto';
import { SignInResult } from '@app/common/dto';



@ApiTags('Auth')
@Controller('auth')
export class AuthGatewayController {
    constructor(
        private authGatewayService: AuthGatewayService
    ) { }

    /**
     * 회원가입
     * @param signUpDto 
     * @returns 
     */
    @ApiOperation({ summary: '회원가입' })
    @ApiBody({ type: UserSignUpDto }) // Swagger 요청 본문 정의
    @Post('/user_signup')
    @UsePipes(ValidationPipe)
    async signUp(@Body() signUpDto: UserSignUpDto, @Res() res: Response) {
        try {
            const result = await this.authGatewayService.signUpUser(signUpDto);
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: 'success',
                result,
            });
        } catch (e) {
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: '[AUTH][CONTROLLER] An error occurred while finding events',
                data: (e as any).message,
            });
        }
    }

    /**
     * 관리자 회원가입
     * @param signUpDto 
     * @returns 
     */
        @ApiOperation({ summary: '관리자 회원가입' })
        @ApiBody({ type: AdminSignUpDto }) // Swagger 요청 본문 정의
        @Post('/admin_signup')
        @UsePipes(ValidationPipe)
        async AdminSignUp(@Body() signUpDto: AdminSignUpDto, @Res() res: Response) {
            try {
                const result = await this.authGatewayService.signUpUser(signUpDto);
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    message: 'success',
                    result,
                });
            } catch (e) {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: '[AUTH][CONTROLLER] An error occurred while finding events',
                    data: (e as any).message,
                });
            }
        }


    /**
     * 로그인
     * @param signInDto
     */
    @ApiOperation({ summary: '로그인' })
    @ApiBody({ type: UserSignInDto })
    @Post('/user_signin')
    async UserSignIn(@Body() UserSignInDto: UserSignInDto, @Res() res: Response) {
        try {
            const result = await this.authGatewayService.signIn(UserSignInDto);
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: 'success',
                result,
            });
        } catch (e) {
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: '[AUTH][CONTROLLER] An error occurred while finding events',
                data: (e as any).message,
            });
        }
    }


    /**
     * 관리자 로그인
     * @param signInDto
     */
    @ApiOperation({ summary: '관리자 로그인' })
    @ApiBody({ type: AdminSignInDto })
    @Post('/admin_signin')
    async AdminSignIn(@Body() AdminSignInDto: AdminSignInDto, @Res() res: Response) {
        try {
            const result = await this.authGatewayService.signIn(AdminSignInDto);
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: 'success',
                result,
            });
        } catch (e) {
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: '[AUTH][CONTROLLER] An error occurred while finding events',
                data: (e as any).message,
            });
        }
    }

    /**
     * 토큰 유효성 검사
     * @param req
     */
    @ApiOperation({ summary: '토큰 유효성 검사' })
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    @Post('check')
    async authCheck(@Req() req: Request, @Res() res: Response) {
        try {
            const user = (req as any).user;
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: 'success',
                user,
            });
        } catch (e) {
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: '[AUTH][CONTROLLER] An error occurred while finding events',
                data: (e as any).message,
            });
        }
    }
}