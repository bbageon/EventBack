import { Role } from "@app/common/enum";
import { SetMetadata } from '@nestjs/common';

// --- ROLES_KEY 상수를 정의하고 export 합니다. ---
export const ROLES_KEY = 'roles'; // <-- 이 라인을 추가합니다.

// 이 데코레이터는 ROLES_KEY 를 사용하여 메타데이터를 설정합니다.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles); // <-- 여기서 ROLES_KEY를 사용합니다.