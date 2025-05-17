import {
  Injectable,
  // InternalServerErrorException, // RpcException으로 변경
  // UnauthorizedException, // RpcException으로 변경
  Logger, // 로깅은 여전히 사용 가능
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// RpcException 임포트
import { RpcException } from '@nestjs/microservices';

// User 스키마 및 문서 타입
import { User, UserDocument } from './schemas/user.schema'; // @app/auth/schemas 등으로 alias 사용 고려

// DTO
import { SignInDto } from './dto/signin.dto'; // @app/auth/dto 등으로 alias 사용 고려
// interface
import { SignInResult } from '@app/common/dto/auth/signin-result';

@Injectable()
export class AuthService {
private readonly logger = new Logger(AuthService.name); // 로거 사용

constructor(
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  private jwtService: JwtService,
  private configService: ConfigService, // 환경 변수 사용 (예: JWT_SECRET)
) { }

/**
 * 로그인
 * @param signInDto 페이로드 (SignInDto 형태)
 * @returns JWT 액세스 토큰
 */
async userSignIn(signInDto: SignInDto): Promise<SignInResult> {
  const { username, password } = signInDto;
  this.logger.log(`Attempting signin for user: "${username}"`); // 로깅 추가

  try {
    // 1. 사용자 인증 (validateUser 메서드 호출)
    const user = await this.validateUser(username, password);

    // 2. 인증 실패 시 (validateUser가 null 반환)
    if (!user) {
      // HTTP 예외 대신 RpcException 발생
      this.logger.warn(`Invalid credentials attempt for user: "${username}"`);
      throw new RpcException('[AUTH][SERVICE] INVALID TOKEN, FAIL TO LOGIN'); // Gateway에서 이 RpcException을 Catch하여 401 등으로 변환
    }

    // 3. 토큰 생성
    const token = await this.createAccessToken(user);

    // 4. 생성된 토큰 객체 반환 (Gateway로 전달됨)
    this.logger.log(`Signin successful for user: "${username}"`);
    return {
        access_token : token.access_token,
        // 필요한 경우 사용자 정보 일부를 함께 반환
        // username : user.username,
        // role : user.role,
    };

  } catch (error) {
    // validateUser 등 내부에서 이미 RpcException을 던졌다면 그대로 다시 던짐
    if (error instanceof RpcException) {
         throw error; // 이미 RpcException이면 그대로 전달
    }
    this.logger.error(`Unexpected error during signin for user "${username}": ${error.message}`, error.stack);
    throw new RpcException('An internal error occurred during signin'); // 일반 오류는 내부 서버 오류로 간주
  }
}


/**
 * 사용자 인증 (내부 사용)
 * @param username
 * @param pass
 * @returns
 */
private async validateUser(username: string, pass: string): Promise<UserDocument | null> {
   this.logger.debug(`Validating user credentials for: "${username}"`);
   try {
      // 1. 사용자 이름으로 데이터베이스에서 사용자 찾기 (비밀번호 필드 포함)
      const user = await this.userModel.findOne({ username }).select('+password').exec();

      // 2. 사용자가 존재하지 않거나 비밀번호 불일치
      if (!user || !(await bcrypt.compare(pass, user.password))) {
        return null; // 사용자가 없거나 비밀번호 불일치 시 null 반환 (예외 던지지 않음)
      }
      // 3. 인증 성공 시, Mongoose Document 자체를 반환합니다.
      return user; // <-- Mongoose Document 자체를 반환 (password 필드 포함 상태)

   } catch (error) {
      this.logger.error(`Error during validateUser for "${username}": ${error.message}`, error.stack);
      throw new RpcException('[AUTH][SERVICE] INVALID DATABASE ');
   }
}

/**
 * 토큰 생성 (내부 사용 또는 서비스에서 호출)
 * @param user Mongoose UserDocument (JWT 페이로드에 필요한 정보 포함)
 * @returns 액세스 토큰 문자열을 포함하는 객체
 */
async createAccessToken(user: UserDocument): Promise<{ access_token: string }> {
  this.logger.debug(`Creating access token for user: "${user.username}"`);
  // JWT 페이로드 구성: UserDocument 객체의 정보를 사용합니다.
  const payload = { username: user.username, sub: user._id.toString(), role: user.role };

  try {
      // JwtService.sign() 메서드를 사용하여 JWT 토큰 문자열을 생성합니다.
      const access_token = this.jwtService.sign(payload);
      this.logger.debug(`[AUTH][SERVICE] SUCCESS TO CREATE TOKEN: "${user.username}"`);
      return { access_token };

  } catch (error) {
       this.logger.error(`Error creating access token for "${user.username}": ${error.message}`, error.stack);
       throw new RpcException('[AUTH][SERVICE] FAIL TO TOKEN CREATE');
  }
}

/**
 * 토큰 확인 (유효성 검증)
 * @param token JWT 토큰 문자열
 * @returns 토큰이 유효하면 JWT 페이로드, 아니면 RpcException 발생
 */
 async validateToken(token: string): Promise<any> { // any 대신 JWT payload 타입을 정의하여 사용하는 것이 좋습니다.
    this.logger.debug(`Validating token: ${token ? token.substring(0, 10) + '...' : 'null'}`); // 토큰 전체 로깅은 보안상 주의

    if (!token) {
         this.logger.warn('Token validation failed: Token is null or empty');
         throw new RpcException('[AUTH][SERVICE] NONE TOKEN'); // 토큰이 없는 경우
    }

    try {
        const payload = this.jwtService.verify(token); // JWT 유효성 검증 및 페이로드 추출
        this.logger.debug(`Token validated successfully for user: "${payload.username}"`);
        return payload; // 유효하면 페이로드 반환

    } catch (error) {
        // JWT 검증 실패 (만료, 형식 오류 등) 시 RpcException 발생
        this.logger.warn(`Token validation failed: ${error.message}`);
        // 'Invalid or expired token' 메시지를 포함하는 RpcException을 발생
        throw new RpcException('[AUTH][SERVICE] INVAILD TOKEN'); // Gateway에서 이 RpcException을 Catch하여 401 등으로 변환
    }
}
}