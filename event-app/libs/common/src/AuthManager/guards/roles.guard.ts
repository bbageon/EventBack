import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';


// TODO: @Roles 데코레이터 및 Role enum 임포트 필요 (실제 경로에 맞게 수정)
import { ROLES_KEY } from '../roles/roles.decorator';
import { Role } from '@app/common/enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {

    // --- canActivate 로직 전체를 try...catch 블록으로 감쌉니다. ---
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const request = context.switchToHttp().getRequest();


      if (!requiredRoles) {
        return true; // 역할 제한이 없으므로 허용
      }

      const user = request.user; // JwtStrategy.validate 에서 반환된 payload

      // user.role 에 접근하기 전에 user 객체가 존재하는지, role 속성이 있는지 안전하게 확인
      const userRole = (user && typeof user === 'object' && user !== null) ? (user as any).role : undefined;



      // 사용자 정보가 없거나 (인증 안 됨), 사용자에게 role 속성이 없거나 -> 접근 거부
      if (!user || userRole === undefined || userRole === null) {
          return false; // 403 Forbidden
      }

      // requiredRoles는 Role[] 타입, userRole은 string (payload.role)
      // 포함 여부 확인
      const hasRequiredRole = requiredRoles.includes(userRole);


      // 필수 역할이 있는 경우 접근 허용 (true), 없는 경우 접근 거부 (false)
      // false를 반환하면 NestJS가 403 Forbidden 처리합니다.
      return hasRequiredRole; // <-- 최종 결과 반환

    } catch (error: any) {
      // --- canActivate 로직 실행 중 예상치 못한 예외 발생 시 ---
      // 예외 발생 시 접근 거부 (false 반환)
      // NestJS가 이 false를 보고 403 Forbidden 응답을 생성합니다.
      return false; // <-- 오류 발생 시 접근 거부
    }
  }
}