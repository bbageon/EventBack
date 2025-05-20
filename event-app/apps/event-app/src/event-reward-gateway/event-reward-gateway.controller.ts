// apps/event-app/src/event-gateway/event-gateway.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  Put,
  ParseArrayPipe,
  ValidationPipe,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { EventRewardGatewayService } from './event-reward-gateway.service';

import { AuthGuard } from '@nestjs/passport';
import { createErrorResponse, createSuccessResponse, RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common';

import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

// Dto
import {
  DailyRewardInfoDto,
  SlotRewardInfoDto,
  DailyCheckinRequestDto,
  DailyCheckinResponseDto,
  WeeklyCheckInRequestDto,
  WeeklyCheckInResponseDto,
  GetUserEventProgressRequestDto,
  UserEventProgressResponseDto,
  getLogDto,
} from '@app/common/dto';



@ApiTags('Reward')
@Controller('event/reward')
@Controller('event-reward-gateway')
export class EventRewardGatewayController {
  constructor(private readonly eventRewardGatewayService: EventRewardGatewayService) { }

  // --- 사용자 이벤트 진행 상태/보상 HTTP 엔드포인트 ---

  /**
   * 일일 출석
   * @param req
   * @param body 
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '사용자 일일 출석 처리' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: DailyCheckinRequestDto })
  @ApiResponse(createSuccessResponse(DailyCheckinResponseDto))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @Post('DailyCheckIn')
  async Dailycheckin(@Req() req: Request, @Body() body: DailyCheckinRequestDto, @Res() res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user.sub;
      const eventId = body.eventId;

      if (!eventId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Event ID is required',
        });
        return; // 응답 후 함수 종료
      }
      const result = await this.eventRewardGatewayService.DailyCheckin(userId, eventId);

      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Check-in processed successfully',
        result: result,
      });

    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }
  /**
   * 주간 보상 수령
   * @param req
   * @param body 
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '사용자 주간 보상 수령' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: WeeklyCheckInRequestDto })
  @ApiResponse(createSuccessResponse(WeeklyCheckInResponseDto))
  @ApiResponse(createErrorResponse('Error message'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @Post('WeeklyCheckIn')
  async WeeklyCheckIn(@Req() req: Request, @Body() body: any, @Res() res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user.sub;
      const eventId = body.eventId;

      if (!eventId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Event ID is required',
        });
        return;
      }

      const result = await this.eventRewardGatewayService.WeeklyCheckIn(userId, eventId);

      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Gauge reward claimed successfully',
        result: result,
      });

    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'An error occurred';
      const data = error.data || error.message;

      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 이벤트 이력 조회
   * @param req 
   * @param query 
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '사용자 이벤트 보상 이력 조회' })
  @ApiBearerAuth('access-token')
  @ApiQuery({ type: GetUserEventProgressRequestDto })
  @ApiResponse(createSuccessResponse(UserEventProgressResponseDto))
  @ApiResponse(createErrorResponse('Error message'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @Get('eventInfo')
  async getUserEventProgress(@Req() req: Request, @Query() query: any, @Res() res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user.sub;
      const eventId = query.eventId;
      if (!eventId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Event ID is required',
        });
        return;
      }
      const result = await this.eventRewardGatewayService.getUserEventProgress(userId, eventId);
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).json({
          status: HttpStatus.NOT_FOUND,
          message: 'User progress not found for this event',
        });
        return;
      }
      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'User event progress retrieved successfully',
        result: result,
      });
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT-REWARD][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 일일 보상 설정 및 업데이트
   * @param eventId
   * @param dailyRewardsData 
   * @param res 
   */
  @Put('daily-rewards/:id') 
  @ApiOperation({ summary: '이벤트의 일일 보상 정보 설정[단일, 복수]' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: '이벤트의 고유 ID', type: String, example: '1' })
  @ApiBody({ type: [DailyRewardInfoDto], description: '설정할 전체 일일 보상 목록' })
  @ApiResponse(createErrorResponse('Error message'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  async setDailyRewards(
    @Param('id') id: number,
    @Body(new ParseArrayPipe({ items: DailyRewardInfoDto, optional: false }))
    dailyRewardsData: DailyRewardInfoDto[],
    @Res() res: Response,
  ): Promise<void> {
    try {
      const resultFromMicroservice =
        await this.eventRewardGatewayService.setDailyRewardsForEvent(
          id,
          dailyRewardsData,
        );
      res.status(HttpStatus.OK).json(resultFromMicroservice);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT-REWARD][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 주간 보상 설정
   * @param id
   * @param slotRewardsData 
   * @param res 
   */
  @Put('slot-rewards/:id')
  @ApiOperation({ summary: '이벤트의 슬롯(게이지) 보상 정보 설정[단일, 복수]' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: '이벤트의 고유 ID', type: String, example: '1' })
  @ApiBody({ type: [SlotRewardInfoDto], description: '설정할 전체 슬롯 보상 목록' })
  @ApiResponse(createErrorResponse('Error message'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  async setSlotRewards(
    @Param('id') id: number,
    @Body(new ParseArrayPipe({ items: SlotRewardInfoDto, optional: false }))
    slotRewardsData: SlotRewardInfoDto[],
    @Res() res: Response,
  ): Promise<void> {
    try {
      const resultFromMicroservice = await this.eventRewardGatewayService.setSlotRewardsForEvent(
          id,
          slotRewardsData,
        );
      res.status(HttpStatus.OK).json(resultFromMicroservice);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT-REWARD][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 보상 이력(로그) 조회
   * @param queryDto 
   * @param res 
   */
  @Get('reward-logs')
  @ApiOperation({ summary: '전체 사용자 보상 수령 이력 조회' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  async getAllRewardClaimLogs(
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false })) 
    queryDto: getLogDto, // 단순화된 DTO 사용
    @Res() res: Response,
  ): Promise<void> {
    try {
      const resultFromMicroservice = 
        await this.eventRewardGatewayService.getRewardLogs(queryDto); 
      res.status(HttpStatus.OK).json(resultFromMicroservice);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT-REWARD][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }
}
