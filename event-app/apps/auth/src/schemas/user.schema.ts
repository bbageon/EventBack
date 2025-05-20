import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Role } from '@app/common'; 
import { Document, Types } from 'mongoose'; 

export type UserDocument = User & Document;

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