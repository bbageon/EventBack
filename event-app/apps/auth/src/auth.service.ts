import {
  ConflictException, // 서비스에서 던질 표준 예외
  Injectable,
  InternalServerErrorException, // 서비스에서 던질 표준 예외
  NotFoundException, // 서비스에서 던질 표준 예외
  UnauthorizedException, // 서비스에서 던질 표준 예외
  // Logger, // Logger 제거
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// User 스키마 및 문서 타입 (Auth 앱 내부에 유지)
import { User, UserDocument } from './schemas/user.schema';

// DTO (공유 라이브러리에서 임포트)
import { UserSignInDto } from '@app/common/dto'; // Path Alias 사용
import { UserSignUpDto } from '@app/common/dto'; // Path Alias 사용
import { UserDto } from '@app/common/dto'; // Path Alias 사용
import { SignInResult } from '@app/common/dto/Signin-result';

function mapUserDocumentToUserDto(user: UserDocument): UserDto {
  if (!user) return null;
  const userObject = user.toObject();
  delete userObject.password; // 비밀번호 필드 명시적 제외
  return {
    id: userObject._id.toString(),
    username: userObject.username,
    role: userObject.role,
    // 다른 필요한 속성 추가 (createdAt, updatedAt 등)
    createdAt: userObject.createdAt, // timestamps: true 사용 시
    updatedAt: userObject.updatedAt, // timestamps: true 사용 시
  };
}


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }


  /**
   * 로그인
   * @param signInDto
   * @returns JWT 액세스 토큰 (SignInResult 형태)
   * @throws UnauthorizedException (인증 실패 시)
   * @throws InternalServerErrorException (내부 오류 시)
   */
  async userSignIn(signInDto: UserSignInDto): Promise<SignInResult> {
    const { username, password } = signInDto;

    try {
      const user = await this.validateUser(username, password);

      if (!user) {
        throw new UnauthorizedException('[AUTH][SERVICE] Invalid credentials');
      }
      const token = await this.createAccessToken(user);
      return {
        access_token: token.access_token,
      };
    } catch (error: any) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      throw new InternalServerErrorException('[AUTH][SERVICE] An error occurred while creating the event', `${(error as any).message}`);
    }
  }

  /**
   * 사용자 인증 (유저 및 비밀번호 검사)
   * @param username 
   * @param pass 
   * @returns 
   */
  private async validateUser(username: string, pass: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne({ username }).select('+password').exec();
      if (!user || !(await bcrypt.compare(pass, user.password))) {
        return null;
      }
      return user;

    } catch (error: any) {
      throw new InternalServerErrorException('[AUTH][SERVICE] Error during credential validation', { cause: error });
    }
  }

  /**
   * 토큰 생성
   * @param user Mongoose UserDocument
   * @returns 액세스 토큰 문자열을 포함하는 객체
   * @throws InternalServerErrorException (토큰 생성 오류 시)
   */
  async createAccessToken(user: UserDocument): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user._id.toString(), role: user.role };

    try {
      const access_token = this.jwtService.sign(payload);
      return { access_token };

    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('[AUTH][SERVICE] An internal error occurred during sign-in', { cause: error });
    }
  }


  /**
   * 비밀번호 해싱 (내부 사용)
   * @param password 평문 비밀번호
   * @returns 해싱된 비밀번호
  */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }



  /**
   * 사용자 회원가입
   * @param signUpDto
   * @returns 새로 생성된 사용자 DTO (비밀번호 제외)
   */
  async signUp(signUpDto: UserSignUpDto): Promise<UserDocument> {
    const { _id, username, password, role } = signUpDto;
    const hashedPassword = await this.hashPassword(password); 

    // 1. 새 사용자 문서 객체 생성
    const newUser = new this.userModel({
      _id,
      username,
      password: hashedPassword,
      role: role,
    });
    try {
      // 2. 데이터베이스에 문서 저장
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error: any) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      throw new InternalServerErrorException('[AUTH][SERVICE] An error occurred while creating the event', `${(error as any).message}`);
    }
  }

  /**
   * 유저 단일 조회
   * @param id 
   * @returns
   */
  async findById(id: string): Promise<UserDto | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        return null;
      }
      // this.logger.debug(`User found by ID: "${id}"`); // 로그 제거
      return mapUserDocumentToUserDto(user);

    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('[AUTH][SERVICE]An internal error occurred during sign-in', { cause: error });
    }
  }
}