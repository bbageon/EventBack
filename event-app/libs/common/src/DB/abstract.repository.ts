import { Logger, NotFoundException } from '@nestjs/common';
import {
    FilterQuery,
    Model,
    Types,
    UpdateQuery,
    SaveOptions,
    Connection,
    Document,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

// Lean 타입 유틸리티 정의 (mongoose v8 이상에서는 직접 만들어야 함)
type Lean<T> = Omit<T, keyof Document>;

/**
 * Abstract base repository for Mongoose models.
 */
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger;

    constructor(
        protected readonly model: Model<TDocument>,
        private readonly connection: Connection,
    ) {}

    async create(
        document: Omit<TDocument, '_id'>,
        options?: SaveOptions,
    ): Promise<Lean<TDocument>> {
        const createdDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        const saved = await createdDocument.save(options);
        return saved.toObject() as Lean<TDocument>;
    }

    async findOne(filterQuery: FilterQuery<TDocument>): Promise<Lean<TDocument>> {
        const document = await this.model.findOne(filterQuery).lean().exec();

        if (!document) {
            this.logger.warn('Document not found with filterQuery', filterQuery);
            throw new NotFoundException('Document not found.');
        }

        return document as Lean<TDocument>;
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
    ): Promise<Lean<TDocument>> {
        const document = await this.model.findOneAndUpdate(filterQuery, update, {
            lean: true,
            new: true,
        }).exec();

        if (!document) {
            this.logger.warn(`Document not found with filterQuery:`, filterQuery);
            throw new NotFoundException('Document not found.');
        }

        return document as Lean<TDocument>;
    }

    async upsert(
        filterQuery: FilterQuery<TDocument>,
        document: Partial<TDocument>,
    ): Promise<Lean<TDocument>> {
        const upserted = await this.model.findOneAndUpdate(filterQuery, document, {
            lean: true,
            upsert: true,
            new: true,
        }).exec();

        return upserted as Lean<TDocument>;
    }

    async find(filterQuery: FilterQuery<TDocument>): Promise<Lean<TDocument>[]> {
        const documents = await this.model.find(filterQuery, {}, { lean: true }).exec();
        return documents as Lean<TDocument>[];
    }

    async startTransaction() {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
    }
}
