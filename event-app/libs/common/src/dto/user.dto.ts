import { ApiProperty } from '@nestjs/swagger'; // Swagger 문서 생성을 위해 필요
import { Role } from '../enum';

export class UserDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: '60f8a7b5c3f9d5a1b2c3d4e0', // 예시 MongoDB ObjectId
    type: String, // TypeScript 타입은 string
  })
  id: string; 

  @ApiProperty({
    description: '사용자 이름',
    example: 'testuser',
    type: String,
  })
  username: string;

  @ApiProperty({
    description: '사용자 역할 (USER, ADMIN 등)',
    example: 'USER',
    type: String, // Role Enum을 사용한다면 해당 Enum 타입을 여기에 명시
  })
  role: Role

  @ApiProperty({
    description: '사용자 생성일시',
    example: '2023-10-27T10:00:00.000Z', // 예시 ISO 8601 형식
    type: String,
  })
  createdAt: Date; 

   @ApiProperty({
    description: '사용자 정보 수정일시',
    example: '2023-10-27T11:00:00.000Z', // 예시 ISO 8601 형식
    type: String,
  })
  updatedAt: Date; 
}