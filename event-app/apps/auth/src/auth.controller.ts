import {
  Controller,
  UseGuards,
} from '@nestjs/common';

// Service
import { AuthService } from './auth.service'; // 합쳐진 AuthService 주입

// Passport, Guard (마이크로서비스 가드 구현 필요)
import { AuthGuard } from '@nestjs/passport'; // Passport JWT Strategy 사용 시 필요

// DTO 
import { UserSignInDto } from '@app/common/dto'; // Path Alias 사용
import { UserSignUpDto } from '@app/common/dto'; // Path Alias 사용
import { SignInResult } from '@app/common/dto'; // Path Alias 사용

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
    throw new Error('Method not implemented.');
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
      throw new RpcException(error);
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
        throw new RpcException('User not found');
      }
      return user; // UserDto 반환

    } catch (error: any) {
      throw new RpcException(error);
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
      throw new RpcException(error);
    }
  }
}