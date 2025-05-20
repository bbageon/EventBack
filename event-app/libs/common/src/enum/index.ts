export enum Role {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

// 이벤트 상태
export enum EventStatus {
  SCHEDULED = 'SCHEDULED', // 예정
  ACTIVE = 'ACTIVE',       // 활성 (진행 중)
  ENDED = 'ENDED',         // 종료
  INACTIVE = 'INACTIVE',   // 비활성 (운영자에 의해 중지)
}

// 이벤트 조건
export enum EventConditionType {
  LOGIN_STREAK = 'LOGIN_STREAK', // 연속 접속 (예: { days: 3 })
  DAILY_LOGIN_COUNT = 'DAILY_LOGIN_COUNT', // 누적 일일 접속 (예: { days: 5 })
  PLAYTIME_TOTAL = 'PLAYTIME_TOTAL', // 누적 플레이 시간 (예: { minutes: 180 })
  PLAYTIME_SESSION = 'PLAYTIME_SESSION', // 단일 접속 플레이 시간 (예: { minutes: 60 })
  LEVEL_ACHIEVEMENT = 'LEVEL_ACHIEVEMENT', // 특정 레벨 달성 (예: { level: 200 })
  MONSTER_KILL_ANY = 'MONSTER_KILL_ANY', // 모든 몬스터 처치 수 (예: { count: 1000, levelRange?: '150-200' })
  MONSTER_KILL_SPECIFIC = 'MONSTER_KILL_SPECIFIC', // 특정 몬스터 처치 수 (예: { monsterId: 'someMonsterCode', count: 100 })
  BOSS_KILL_SPECIFIC = 'BOSS_KILL_SPECIFIC', // 특정 보스 처치 (예: { bossId: 'zakum', count: 1 })
  ITEM_COLLECT = 'ITEM_COLLECT', // 특정 아이템 수집 (예: { itemId: 'eventCoin', count: 50 })
  QUEST_COMPLETE_SPECIFIC = 'QUEST_COMPLETE_SPECIFIC', // 특정 퀘스트 완료 (예: { questId: 'eventQuest123' })
  PARTY_PLAY_COUNT = 'PARTY_PLAY_COUNT', // 파티 플레이 횟수 (예: { count: 5 })
  FRIEND_INTERACTION = 'FRIEND_INTERACTION', // 친구와 특정 활동 (예: { type: 'partyQuestWithFriend', count: 1 })
  MINIGAME_PLAY_COUNT = 'MINIGAME_PLAY_COUNT', // 미니게임 참여 횟수 (예: { gameId: 'oneCard', count: 3 })
  GUILD_JOIN = 'GUILD_JOIN', // 길드 가입
  GUILD_ACTIVITY_POINTS = 'GUILD_ACTIVITY_POINTS', // 길드 활동 점수 (예: { points: 500 })
  STARFORCE_TOTAL = 'STARFORCE_TOTAL', // 계정 내 총 스타포스 수치 (예: { totalStars: 100 })
  CUSTOM_CONDITION = 'CUSTOM_CONDITION', // 기타 사용자 정의 조건 (description 필수로 상세 설명)
}
export enum MapleRewardId {
  LOG_PLACEHOLDER_FAILURE = 'FAIL_TO_GET_REWARD', // 보상 획득 실패시
  // --- 재화 (Currency & Points) ---
  MESO_1M = 'MESO_1000000', // 100만 메소
  MESO_10M = 'MESO_10000000', // 1000만 메소
  MESO_100M = 'MESO_100000000', // 1억 메소
  MAPLE_POINTS_100 = 'MAPLE_POINTS_100', // 100 메이플포인트
  MAPLE_POINTS_500 = 'MAPLE_POINTS_500', // 500 메이플포인트
  MAPLE_POINTS_1000 = 'MAPLE_POINTS_1000', // 1000 메이플포인트
  MILEAGE_500 = 'MILEAGE_500', // 500 마일리지
  MILEAGE_2000 = 'MILEAGE_2000', // 2000 마일리지
  EVENT_COIN_10 = 'EVENT_COIN_10', // 이벤트 주화 10개
  EVENT_COIN_50 = 'EVENT_COIN_50', // 이벤트 주화 50개
  EVENT_COIN_100 = 'EVENT_COIN_100', // 이벤트 주화 100개
  UNION_COIN_50 = 'UNION_COIN_50', // 유니온 코인 50개
  BOSS_POINT_1000 = 'BOSS_POINT_1000', // 보스 포인트 1000점

  // --- 소비 아이템: 물약 및 버프 (Consumables - Potions & Buffs) ---
  POWER_ELIXIR_X10 = 'POWER_ELIXIR_X10', // 파워 엘릭서 10개
  POWER_ELIXIR_X100 = 'POWER_ELIXIR_X100', // 파워 엘릭서 100개
  EXPERIENCE_COUPON_2X_15MIN_X1 = 'EXPERIENCE_COUPON_2X_15MIN_X1', // 경험치 2배 쿠폰 (15분) 1개
  EXPERIENCE_COUPON_2X_30MIN_X1 = 'EXPERIENCE_COUPON_2X_30MIN_X1', // 경험치 2배 쿠폰 (30분) 1개
  EXPERIENCE_COUPON_3X_15MIN_X1 = 'EXPERIENCE_COUPON_3X_15MIN_X1', // 경험치 3배 쿠폰 (15분) 1개 (매우 희귀)
  WEALTH_ACQUISITION_POTION_X1 = 'WEALTH_ACQUISITION_POTION_X1', // 재물 획득의 비약 1개
  ADVANCED_BOSS_RUSH_POTION_X1 = 'ADV_BOSS_RUSH_POTION_X1', // 고급 보스 격파 물약 1개
  TRAIT_BOOST_POTION_X1 = 'TRAIT_BOOST_POTION_X1', // 성향 성장의 비약 1개
  MVP_PLUS_EXP_BUFF_X1 = 'MVP_PLUS_EXP_BUFF_X1', // MVP 플러스 EXP 버프 (경험치 50% 증가) 1개
  PREPARED_SPIRIT_PENDANT_3D = 'PREPARED_SPIRIT_PENDANT_3D', // 준비된 정령의 펜던트 (3일)

  // --- 소비 아이템: 강화 및 제작 (Consumables - Enhancement/Crafting) ---
  RED_CUBE_X1 = 'RED_CUBE_X1', // 레드 큐브 1개
  BLACK_CUBE_X1 = 'BLACK_CUBE_X1', // 블랙 큐브 1개
  ADDITIONAL_CUBE_X1 = 'ADDITIONAL_CUBE_X1', // 에디셔널 큐브 1개 (이벤트로 자주 풀림)
  KARMA_ETERNAL_REBIRTH_FLAME_X1 = 'KARMA_ETERNAL_REBIRTH_FLAME_X1', // 카르마 영원한 환생의 불꽃 1개
  KARMA_POWERFUL_REBIRTH_FLAME_X1 = 'KARMA_POWERFUL_REBIRTH_FLAME_X1', // 카르마 강력한 환생의 불꽃 1개
  KARMA_CRAFTSMAN_CUBE_X3 = 'KARMA_CRAFTSMAN_CUBE_X3', // 카르마 장인의 큐브 3개
  KARMA_MEISTER_CUBE_X1 = 'KARMA_MEISTER_CUBE_X1', // 카르마 명장의 큐브 1개
  ARCANE_RIVER_DROPLET_STONE_X5 = 'ARCANE_RIVER_DROPLET_STONE_X5', // 아케인리버 물방울석 5개
  STONE_ORIGIN_DROPLET_X5 = 'STONE_ORIGIN_DROPLET_X5', // 태초의 물방울석 5개 (보스 드랍이지만 이벤트로도)
  SUSPICIOUS_CUBE_X50 = 'SUSPICIOUS_CUBE_X50', // 수상한 큐브 50개
  GOLD_POTENTIAL_STAMP_X1 = 'GOLD_POTENTIAL_STAMP_X1', // 금빛 각인의 인장 1개
  SPECIAL_ADDITIONAL_POTENTIAL_STAMP_X1 = 'SPECIAL_ADDITIONAL_POTENTIAL_STAMP_X1', // 스페셜 에디셔널 각인의 인장 1개
  KARMA_STAR_FORCE_12_SCROLL_X1 = 'KARMA_STAR_FORCE_12_SCROLL_X1', // 카르마 12성 스타포스 100% 강화권 1개
  KARMA_STAR_FORCE_15_SCROLL_X1 = 'KARMA_STAR_FORCE_15_SCROLL_X1', // 카르마 15성 스타포스 100% 강화권 1개
  KARMA_STAR_FORCE_17_SCROLL_X1 = 'KARMA_STAR_FORCE_17_SCROLL_X1', // 카르마 17성 스타포스 100% 강화권 1개 (매우 희귀)
  CHAOS_SCROLL_OF_GOODNESS_60_X1 = 'CHAOS_SCROLL_OF_GOODNESS_60_X1', // 긍정의 혼돈 주문서 60% 1개
  INNOCENCE_SCROLL_50_X1 = 'INNOCENCE_SCROLL_50_X1', // 순백의 주문서 50% 1개

  // --- 소비 아이템: 유틸리티 및 기타 (Consumables - Utility/ETC) ---
  SAFETY_CHARM_X5 = 'SAFETY_CHARM_X5', // 세이프티  참 5개 (기간제)
  TELEPORT_WORLD_MAP_7D_X1 = 'TELEPORT_WORLD_MAP_7D_X1', // 텔레포트 월드맵 (7일) 1개
  CHARACTER_SLOT_COUPON_X1 = 'CHARACTER_SLOT_COUPON_X1', // 캐릭터 슬롯 증가 쿠폰 1개
  PENDANT_SLOT_EXPANSION_30D_X1 = 'PENDANT_SLOT_EXPANSION_30D_X1', // 펜던트 슬롯 확장권 (30일) 1개
  MIRACLE_CIRCULATOR_X3 = 'MIRACLE_CIRCULATOR_X3', // 미라클 서큘레이터 3개
  SILVER_KARMA_SCISSORS = 'SILVER_KARMA_SCISSORS', // 은빛 카르마의 가위
  PET_FOOD_X30 = 'PET_FOOD_X30', // 펫 먹이 30개
  MEISTER_ACCESSORY_CRAFT_COUPON = 'MEISTER_ACCESSORY_CRAFT_COUPON', // 장신구 명장 제작 쿠폰

  // --- 치장/외형 (Cosmetics/Appearance) ---
  ROYAL_HAIR_COUPON_X1 = 'ROYAL_HAIR_COUPON_X1', // 로얄 헤어쿠폰 1개
  ROYAL_FACE_COUPON_X1 = 'ROYAL_FACE_COUPON_X1', // 로얄 성형쿠폰 1개
  CHOICE_HAIR_COUPON_X1 = 'CHOICE_HAIR_COUPON_X1', // 초이스 헤어쿠폰 1개
  CHOICE_FACE_COUPON_X1 = 'CHOICE_FACE_COUPON_X1', // 초이스 성형쿠폰 1개
  EVENT_RANDOM_DAMAGE_SKIN_BOX_X1 = 'EVENT_RANDOM_DAMAGE_SKIN_BOX_X1', // 이벤트 데미지 스킨 상자 (랜덤) 1개
  EVENT_RANDOM_CHAIR_BOX_X1 = 'EVENT_RANDOM_CHAIR_BOX_X1', // 이벤트 의자 상자 (랜덤) 1개
  EVENT_MOUNT_90D_BOX_X1 = 'EVENT_MOUNT_90D_BOX_X1', // 이벤트 라이딩 90일 이용권 상자 (랜덤) 1개
  PET_DYE_COUPON = 'PET_DYE_COUPON', // 펫 염색 쿠폰
  MANNEQUIN_TICKET = 'MANNEQUIN_TICKET', // 헤어룸 슬롯 확장권 (마네킹)

  // --- 성장/진행 (Growth/Progression) ---
  CORE_GEMSTONE_X10 = 'CORE_GEMSTONE_X10', // 코어 젬스톤 10개
  CORE_GEMSTONE_X50 = 'CORE_GEMSTONE_X50', // 코어 젬스톤 50개
  EXPERIENCE_NODESTONE_X1 = 'EXPERIENCE_NODESTONE_X1', // 경험의 코어 젬스톤 1개
  SELECTIVE_ARCANE_SYMBOL_X20 = 'SELECTIVE_ARCANE_SYMBOL_X20', // 선택 아케인심볼 20개
  SELECTIVE_ARCANE_SYMBOL_X100 = 'SELECTIVE_ARCANE_SYMBOL_X100', // 선택 아케인심볼 100개
  SELECTIVE_AUTHENTIC_SYMBOL_X10 = 'SELECTIVE_AUTHENTIC_SYMBOL_X10', // 선택 어센틱심볼 10개
  SELECTIVE_AUTHENTIC_SYMBOL_X50 = 'SELECTIVE_AUTHENTIC_SYMBOL_X50', // 선택 어센틱심볼 50개
  TYPHOON_GROWTH_POTION_X1 = 'TYPHOON_GROWTH_POTION_X1', // 태풍 성장의 비약 1개 (200-249 사용 가능)
  MAGNIFICENT_GROWTH_POTION_X1 = 'MAGNIFICENT_GROWTH_POTION_X1', // 극한 성장의 비약 1개 (200-259 사용 가능, 매우 희귀)

  // --- 특별 이벤트 아이템 (Special Event Items) ---
  EVENT_SPECIAL_TITLE_PERMANENT = 'EVENT_SPECIAL_TITLE_PERMANENT', // 이벤트 특별 칭호 (영구)
  EVENT_OUTFIT_SET_BOX_PERMANENT = 'EVENT_OUTFIT_SET_BOX_PERMANENT', // 이벤트 코디 세트 상자 (영구)
  EVENT_PET_PERMANENT_BOX = 'EVENT_PET_PERMANENT_BOX', // 이벤트 펫 상자 (펫 + 펫장비, 영구)
  UNIQUE_POTENTIAL_SCROLL_100_X1 = 'UNIQUE_POTENTIAL_SCROLL_100_X1', // 유니크 잠재능력 부여 주문서 100% 1개
  LEGENDARY_POTENTIAL_SCROLL_50_X1 = 'LEGENDARY_POTENTIAL_SCROLL_50_X1', // 레전드리 잠재능력 부여 주문서 50% 1개 (매우매우 희귀)
  ABSOLAB_WEAPON_BOX = 'ABSOLAB_WEAPON_BOX', // 앱솔랩스 무기 상자
  ARCANE_SHADE_WEAPON_BOX = 'ARCANE_SHADE_WEAPON_BOX', // 아케인셰이드 무기 상자 (매우 희귀)
}