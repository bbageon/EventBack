import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../libs/common/src/DB/abstract.repository'; // 경로는 프로젝트 구조에 맞게 수정
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
    protected readonly logger = new Logger(UserRepository.name);

    constructor(
        @InjectModel(User.name) userModel: Model<UserDocument>,
        @InjectConnection() connection: Connection,
    ) {
        super(userModel, connection);
    }

    // 필요에 따라 User 전용 메서드 확장도 가능
    async findByUsername(username: string) {
        return this.findOne({ username });
    }
}
