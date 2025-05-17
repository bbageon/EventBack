import { Controller, Get, Inject, HttpStatus, Res, Req, UseGuards } from '@nestjs/common'; // 필요한 임포트들
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

// ... 다른 임포트 ...

@Controller('auth') // 클라이언트 접근 경로: /auth
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy // 주입
  ) { }

  // *** 이 부분을 수정합니다. ***
  @Get('users') // <-- 'users' 경로를 명시하여 GET /auth/users 요청을 처리하도록 합니다.
  // @UseGuards(AuthGuard('jwt'), RolesGuard) // 인증 및 권한 Guard 적용 (필요시)
  // @Roles(Role.ADMIN) // 예시: ADMIN만 접근 가능 (필요시)
  async getUsers(@Req() req, @Res() res: Response) { // @Res() 사용 시 직접 응답 처리
    // Auth 서비스로 'get_users' 패턴 메시지 전송, 응답 대기
    const result = await firstValueFrom(
      this.authServiceClient.send('get_users', {}) // 페이로드에 필요한 데이터 추가 (현재는 빈 객체)
    );
    console.log(result);
  }
}


