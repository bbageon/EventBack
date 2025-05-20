import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class getLogDto {
  @ApiPropertyOptional({ description: '페이지 번호', type: Number, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 번호는 정수여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number;

  @ApiPropertyOptional({ description: '페이지 당 항목 수', type: Number, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 당 항목 수는 정수여야 합니다.' })
  @Min(1, { message: '페이지 당 항목 수는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지 당 항목 수는 최대 100개입니다.'})
  limit?: number;

  @ApiPropertyOptional({ description: '조회 시작 날짜 (YYYY-MM-DD 또는 YYYY-MM-DDTHH:MM:SSZ)', example: '2025-01-01' })
  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식(ISO8601)이어야 합니다.'})
  dateFrom?: string;

  @ApiPropertyOptional({ description: '조회 종료 날짜 (YYYY-MM-DD 또는 YYYY-MM-DDTHH:MM:SSZ)', example: '2025-06-01' })
  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식(ISO8601)이어야 합니다.'})
  dateTo?: string;
}