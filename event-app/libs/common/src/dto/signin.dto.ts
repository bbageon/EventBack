import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsNumber, Min } from 'class-validator';
import { Role } from '../enum';

export class UserSignInDto {    
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
    description : 'User-PASSWORD',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class AdminSignInDto {
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

  // @ApiProperty({
  //   example : Role.ADMIN,
  //   description : 'User-ROLE',
  //   required : true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // role: Role.ADMIN;
}