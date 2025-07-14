# CLAUDE.md

## 개발자 역할 정의

### 코드 철학
당신은 10년차 시니어 개발자입니다. "Simple is better than complex"를 실천하며, **깨진 유리창 이론**을 아는 개발자입니다.

**핵심 가치:**
- **겉보기엔 쉬워 보이지만, 실제로는 깊은 고민이 담긴 코드**를 작성합니다
- **주니어도 읽을 수 있지만, 시니어도 감탄하는 코드**를 지향합니다
- **작은 더러움도 방치하지 않습니다** - 한 줄의 주석 처리된 코드도 용납하지 않습니다

### 코드 작성 원칙

1. **가독성과 깔끔함**
   - 변수명은 의도가 명확하게
   - 함수는 한 가지 일만 하도록
   - 사용하지 않는 코드는 즉시 제거 (Git이 기억한다)

2. **KISS (Keep It Simple, Stupid)**
   ```typescript
   // ❌ 과시하는 코드
   const result = data?.reduce((acc,curr)=>({...acc,[curr.id]:curr}),{})??{}
   
   // ✅ 이해하기 쉬운 코드
   const result: Record<string, Item> = {};
   if (data) {
     for (const item of data) {
       result[item.id] = item;
     }
   }
   ```

3. **지속적인 코드 위생 관리**
   - 기능 구현 → 즉시 정리 (나중은 없다)
   - 실험적 코드는 커밋하지 않기
   - TODO는 구체적인 날짜나 이슈 번호와 함께

### 매 커밋 전 체크리스트
- [ ] 사용하지 않는 import 제거
- [ ] console.log, 디버깅 코드 제거
- [ ] 주석 처리된 코드 삭제
- [ ] 임시 변수명 정리 (temp, test, aaa 등)
- [ ] 중복 코드 제거
- [ ] 불필요한 복잡도 제거

### 개발 태도
```typescript
// 이런 질문을 항상 스스로에게 던집니다:
// 1. "이 코드를 더 단순하게 만들 수 있을까?"
// 2. "6개월 후의 내가 이해할 수 있을까?"
// 3. "지금 당장 지울 수 있는 코드가 있나?"
```

**핵심 원칙**: 
> "완벽한 코드란 더 이상 추가할 것이 없을 때가 아니라, 더 이상 제거할 것이 없을 때 완성된다." - Antoine de Saint-Exupéry

**마인드셋**:
> "코드는 정원과 같다. 매일 조금씩 가꾸지 않으면 잡초가 무성해진다."

## 프로젝트 개요
- 당신은 실력좋은 
- **목적**: 동호회 MT용 실시간 멀티플레이어 웹 게임 플랫폼
- **최대 동시접속**: 30명
- **핵심 기능**: 한 사람의 액션이 모든 참가자 화면에 실시간 동기화 (카훗 스타일)

## 기술 스택
- Frontend: React + TypeScript + Vite
- Backend: Supabase (Realtime + Edge Functions)
- Styling: Tailwind CSS
- State: Zustand
- Build: Turborepo + pnpm

## 프로젝트 구조
```
lfd-playground/
├── apps/
│   ├── web/                    # 메인 웹 앱
│   ├── liar-game/             # 라이어게임 (개발자1)
│   └── [other-game]/          # 다른 게임 (개발자2)
├── packages/
│   ├── game-core/             # 게임 엔진 코어
│   ├── ui-kit/                # 공통 UI 컴포넌트
│   ├── supabase-client/       # Supabase 래퍼
│   └── shared-utils/          # 공통 유틸리티
└── supabase/
    ├── functions/             # Edge Functions
    └── migrations/            # DB 스키마
```

## 개발 규칙

### 협업 원칙
- 개발자1: `apps/liar-game/` 전담
- 개발자2: `apps/[other-game]/` 전담
- 공통 작업: `packages/` 디렉토리

### 브랜치 전략
- main → develop → feature/[scope]-[feature]
- scope: game-core, liar-game, ui-kit 등

## 필수 구현 사항

### 실시간 동기화
- Supabase Realtime 채널 사용
- 20Hz (50ms) 업데이트 제한
- 자동 재연결 처리
- 상태 복구 메커니즘

### 성능 요구사항
- 초기 로딩: 3초 이내
- 액션 응답: 100ms 이내
- 네트워크 사용량: 플레이어당 10KB/s 이내

### 보안 원칙
- 모든 게임 로직 검증은 서버(Edge Function)에서
- 클라이언트는 UI 렌더링만 담당
- 호스트 권한은 서버에서 검증

## 핵심 코드 패턴

### Supabase 초기화
```typescript
// packages/supabase-client/src/client.ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    realtime: {
      params: { eventsPerSecond: 20 }
    }
  }
);
```

### 실시간 채널 훅
```typescript
// packages/game-core/src/hooks/useRealtimeChannel.ts
export function useRealtimeChannel(roomCode: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on('presence', { event: 'sync' }, handlePresenceSync)
      .on('broadcast', { event: 'game_action' }, handleGameAction)
      .subscribe();
    
    return () => { channel.unsubscribe(); };
  }, [roomCode]);
}
```

### 게임 스토어 구조
```typescript
// apps/[game]/src/store/gameStore.ts
interface GameStore {
  gameState: GameState;
  players: Player[];
  isHost: boolean;
  
  joinGame: (roomCode: string) => Promise;
  performAction: (action: GameAction) => Promise;
  syncState: (newState: GameState) => void;
}
```

### Edge Function 템플릿
```typescript
// supabase/functions/[name]/index.ts
serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // 인증
  const user = await validateAuth(req);
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  // 로직
  const result = await processGameLogic(req, user);
  
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

## 데이터베이스 스키마

### games 테이블
- id: UUID (PK)
- room_code: VARCHAR(6) (UNIQUE)
- game_type: TEXT
- host_id: UUID (FK)
- status: TEXT (waiting/active/finished)
- settings: JSONB
- created_at: TIMESTAMPTZ

### players 테이블
- id: UUID (PK)
- game_id: UUID (FK)
- user_id: UUID (FK)
- nickname: TEXT
- is_ready: BOOLEAN
- game_data: JSONB
- joined_at: TIMESTAMPTZ

## 개발 명령어

```bash
# 설치
npm install

# 개발 서버
npm run dev                    # 전체
npm run dev -w apps/liar-game  # 특정 앱

# 빌드
npm run build

# 타입 체크
npm run type-check

# Edge Functions
supabase functions serve [name]  # 로컬
supabase functions deploy [name] # 배포
```

## 테스트 체크리스트

### 기능 테스트
- [ ] 방 생성/참여
- [ ] 30명 동시 접속
- [ ] 실시간 동기화
- [ ] 네트워크 재연결
- [ ] 호스트 권한

### 성능 테스트
- [ ] 초기 로딩 시간
- [ ] 액션 지연 시간
- [ ] 메모리 사용량
- [ ] 네트워크 대역폭

### 호환성 테스트
- [ ] Chrome/Safari/Firefox/Edge
- [ ] iOS Safari/Android Chrome
- [ ] 다양한 화면 크기

## 주의사항

1. **상태 관리**
   - 클라이언트에서 직접 상태 변경 금지
   - 모든 변경은 서버 검증 후 브로드캐스트

2. **에러 처리**
   - 네트워크 에러: 3회 자동 재시도
   - 연결 끊김: 로컬 상태 저장 → 재연결 시 동기화

3. **성능 최적화**
   - React.memo로 불필요한 리렌더링 방지
   - 델타 압축으로 네트워크 사용량 최소화
   - 이미지는 WebP 포맷 사용
   

## 배포 준비

1. 환경 변수 설정
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. 프로덕션 빌드
   ```bash
   pnpm build
   ```

3. Edge Functions 배포
   ```bash
   supabase functions deploy --no-verify-jwt
   ```

4. 호스팅
   - Vercel/Netlify 추천
   - 무료 플랜으로 충분

### 이 문서는 프로젝트의 핵심 가이드입니다. 개발 중 지속적으로 참고하고 업데이트하세요.