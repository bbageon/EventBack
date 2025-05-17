import {
  Controller,
  UnauthorizedException,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';

// Service
import { AuthService } from './auth.service';

// Passport, Guard
import { AuthGuard } from '@nestjs/passport'; 
import { RolesGuard } from './roles';
import { Roles } from './roles';
import { Role } from './enum';

// Swagger, Dto
import { SignInDto } from './dto';

// MicroService
import { ClientProxy, MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AuthController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
  ) {}
  
  @MessagePattern('get_users')
  async getUsers() {
    this.logger.log('>>> Received get_users message in Auth service');
    return [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
  }

  @MessagePattern('signin')
  // @UseGuards(...) // 필요하다면 내부 인증/권한 가드 적용
  async signInMessage(@Payload() payload: SignInDto) { // 페이로드에 SignInDto 데이터가 담겨옴
    this.logger.log(`Received signin message with payload: ${JSON.stringify(payload)}`);
    // const { username, password } = payload; // 페이로드에서 데이터 사용

    try {
      const user = await this.authService.userSignIn(payload);
      return user; // 또는 { status: ..., message: ..., data: ... } 형태로 리턴 고려

    } catch (error) {
      this.logger.error('Error processing signin message:', error.message);
      if (error instanceof UnauthorizedException) {
           throw new UnauthorizedException(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  // Gateway에서 client.send('get_profile', payload) 호출 시 이 메소드가 받습니다.
  @MessagePattern('get_profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfileMessage(@Payload() payload: any, @Req() req: any) {
     this.logger.log('Received get_profile message');
     // Gateway에서 페이로드에 사용자 정보(JWT payload 등)를 담아 보냈다면 payload에서 사용
     const user = payload; // 예시: Gateway가 페이로드에 사용자 정보를 담아 보냈다고 가정

     try {
        // 프로필 조회 로직 또는 사용자 정보 반환
        // return user; // 사용자 정보를 그대로 반환
        return { message: 'Profile fetched successfully', data: user }; // 예시 응답 형식

     } catch (error) {
         this.logger.error('Error processing get_profile message:', error.message);
         throw new Error('Failed to fetch profile'); // 또는 RpcException
     }
  }

  // 다른 API 엔드포인트들도 @MessagePattern 을 사용하여 마이크로서비스 핸들러로 변환
  @MessagePattern('get_admin_data') // 'get_admin_data' 패턴 핸들러
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 내부 가드 적용
  // @Roles(Role.ADMIN) // Role 데코레이터는 가드 내에서 활용
  async getAdminDataMessage(@Payload() payload: any) {
     this.logger.log('Received get_admin_data message');
     const user = payload; // Gateway에서 넘겨준 사용자 정보

     // Role 검증 로직은 RolesGuard 안에서 수행
     // RolesGuard가 통과되면 아래 코드 실행
     return { message: 'Welcome, Admin! This is admin-only data.', data: user };

  }

  @MessagePattern('auth_check') // 'auth_check' 패턴 핸들러
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 내부 가드 적용
  // @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN) // RolesGuard 안에서 활용
  async authCheckMessage(@Payload() payload: any) {
      this.logger.log('Received auth_check message');
      const user = payload; // Gateway에서 넘겨준 사용자 정보

      // 가드 통과 후 실행
      return { message: 'Token is valid', data: user };
  }
}