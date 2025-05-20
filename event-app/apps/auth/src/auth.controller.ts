import {
  Controller,
  UseGuards,
} from '@nestjs/common';

// Service
import { AuthService } from './auth.service'; 

// Passport, Guard 
import { AuthGuard } from '@nestjs/passport'; // Passport JWT Strategy 사용 시 필요

// DTO 
import { UserSignInDto } from '@app/common/dto'; 
import { UserSignUpDto } from '@app/common/dto'; 
import { SignInResult } from '@app/common/dto'; 

// MicroService
import {
  MessagePattern,
  Payload,
  Ctx,
  RpcException,
} from '@nestjs/microservices';


@Controller()
export class AuthController {
  getHello(): any {
    throw new Error('[AUTH][CONTROLLER] Method not implemented.');
  }
  constructor(
    private authService: AuthService,
  ) { }

  /**
   * 로그인
   * @param payload 
   * @returns 
   */
  @MessagePattern('signin') // 메시지 패턴 정의
  async signInMessage(@Payload() payload: UserSignInDto): Promise<SignInResult> {
    try {
      const userResult = await this.authService.userSignIn(payload);
      return userResult;
    } catch (error: any) {
      throw new RpcException(error || '[AUTH][CONTROLLER]');
    }
  }

  /**
   * 유저 조회
   * @param payload 
   * @param context 
   * @returns 
   */
  @MessagePattern('get_profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfileMessage(@Payload() payload: any /* Gateway에서 전달한 JWT payload */, @Ctx() context: any) {
    const userPayload = payload; // 예시: Gateway가 JWT payload를 페이로드로 보냈다고 가정 ({ sub: userId, username: '...', role: '...' })
    try {
      const user = await this.authService.findById(userPayload.sub);
      if (!user) {
        throw new RpcException('[AUTH][CONTROLLER] User not found');
      }
      return user; // UserDto 반환

    } catch (error: any) {
      throw new RpcException(error || '[AUTH][CONTROLLER]');
    }
  }

  /**
   * 사용자 회원가입
   * @param payload
   */
  @MessagePattern('signup')
  async signUpMessage(@Payload() payload: UserSignUpDto) {
    try {
      const result = await this.authService.signUp(payload);
      return result;
    } catch (error: any) {
      throw new RpcException(error || '[AUTH][CONTROLLER]');
    }
  }
}