// apps/auth/src/schemas/user.schema.ts (수정)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Role } from '@app/common'; // 임포트 필요
import { Document, Types } from 'mongoose'; // Mongoose Document 임포트

export type UserDocument = User & Document; // 이 타입 정의는 그대로 둡니다.

@Schema({
    timestamps: true,
    versionKey: false // 필드 자동 생성 방지
})
export class User {
    @Prop({
        type: Number,     
        required: true,
        unique: true,     
      })
    _id: number;
    
    // 사용자 계정
    @Prop({ required: true, unique: true, index: true })
    username: string;

    // 비밀번호
    @Exclude()
    @Prop({ required: true, select: false })
    password: string;

    // 사용자 역할
    @Prop({ required: true, default: Role.USER, type: String })
    role: Role
}

export const UserSchema = SchemaFactory.createForClass(User);