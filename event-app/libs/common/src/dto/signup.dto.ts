// EVENT_BACK/auth-server/src/auth/dto/signup.dto.ts

import { IsString, IsNotEmpty, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum';

export class UserSignUpDto {
  @ApiProperty({
    description: '유저 고유 ID (숫자, 필수)',
    example: 1, // 예시로 숫자 1 사용
    type: Number,
  })
  @IsNumber({}, { message: 'ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'ID는 필수 항목입니다.' })
  @Min(1, { message: 'ID는 1 이상이어야 합니다.' }) // ID 정책에 따라 설정
  _id: number; // 타입을 number로 변경, 클라이언트가 제공
  
  @ApiProperty({
      example : 'test1234@test.com',
      description : 'User-ID',
      required : true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
      example : 'test1234',
      description : 'User-ID',
      required : true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example : Role.USER,
    description : 'User-ROLE',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  role: Role;
}

export class AdminSignUpDto {
  @ApiProperty({
    description: '유저 고유 ID (숫자, 필수)',
    example: 2, // user : 1 admin 2
    type: Number,
  })
  @IsNumber({}, { message: 'ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'ID는 필수 항목입니다.' })
  @Min(1, { message: 'ID는 1 이상이어야 합니다.' }) // ID 정책에 따라 설정
  _id: number; // 타입을 number로 변경, 클라이언트가 제공
  
  @ApiProperty({
    example : 'admin1234@test.com',
    description : 'User-ID',
    required : true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example : 'admin1234',
    description : 'User-PASSWORD',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example : Role.ADMIN,
    description : 'User-ROLE',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  role: Role;
}

export class OperatorSignUpDto {
  @ApiProperty({
    description: '유저 고유 ID (숫자, 필수)',
    example: 3, // user : 1 admin 2
    type: Number,
  })
  @IsNumber({}, { message: 'ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'ID는 필수 항목입니다.' })
  @Min(1, { message: 'ID는 1 이상이어야 합니다.' }) // ID 정책에 따라 설정
  _id: number; // 타입을 number로 변경, 클라이언트가 제공
  
  @ApiProperty({
    example : 'operator1234@test.com',
    description : 'User-ID',
    required : true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example : 'operator1234',
    description : 'User-PASSWORD',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example : Role.OPERATOR,
    description : 'User-ROLE',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  role: Role;
}

export class AuditorSignUpDto {
  @ApiProperty({
    description: '유저 고유 ID (숫자, 필수)',
    example: 4, // user : 1 admin 2
    type: Number,
  })
  @IsNumber({}, { message: 'ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'ID는 필수 항목입니다.' })
  @Min(1, { message: 'ID는 1 이상이어야 합니다.' }) // ID 정책에 따라 설정
  _id: number; // 타입을 number로 변경, 클라이언트가 제공
  
  @ApiProperty({
    example : 'auditor1234@test.com',
    description : 'User-ID',
    required : true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example : 'auditor1234',
    description : 'User-PASSWORD',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example : Role.AUDITOR,
    description : 'User-ROLE',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  role: Role;
}