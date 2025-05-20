import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { MapleRewardId } from '@app/common';

/**
 * 보상 지급 유형 Enum
 * - 어떤 종류의 활동으로 보상을 받았는지 구분
 */
export enum RewardType {
    DAILY_REWARD = 'DAILY_REWARD', // 일일 출석 고정 보상
    SLOT_REWARD = 'SLOT_REWARD',   // 주간 게이지 슬롯 보상
    FAIL = 'FAIL',
}

@Schema({
    timestamps: true, // createdAt (지급/요청 시각), updatedAt 자동 생성
    versionKey: false,
})
export class RewardClaimLog {
    @Prop({ required: true, ref: 'User', index: true })
    userId: number; // 보상을 받은 사용자 ID

    @Prop({ required: true, ref: 'Event', index: true })
    eventId: number; // 관련 이벤트 ID

    @Prop({
        required: true,
        type: String,
        enum: Object.values(MapleRewardId), // MapleRewardId enum 값으로 제한
    })
    rewardId: MapleRewardId; // 지급된 보상 아이템 ID

    @Prop({ required: true, type: Number, min: 0 })
    quantity: number; // 지급된 보상 수량

    @Prop({
        required: true,
        type: String,
        enum: Object.values(RewardType), // ClaimType enum 값으로 제한
        index: true,
    })
    RewardType: RewardType; // 보상 지급 유형 (예: 일일, 주간 게이지 등)

    // 요청에 성공/실패
    @Prop({ type: Boolean, default: false })
    RewardRequireIs: boolean;
}

export type RewardClaimLogDocument = RewardClaimLog & Document;
export const RewardClaimLogSchema = SchemaFactory.createForClass(RewardClaimLog);

// 복합 인덱스 (사용자별, 이벤트별 조회 최적화)
RewardClaimLogSchema.index({ userId: 1, eventId: 1, createdAt: -1 }); // 특정 사용자의 특정 이벤트 참여 이력 (최신순)
RewardClaimLogSchema.index({ eventId: 1, claimType: 1, createdAt: -1 }); // 특정 이벤트의 특정 유형 보상 지급 이력