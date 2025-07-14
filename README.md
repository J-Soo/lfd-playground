# LFD Playground

MT 게임 플랫폼 - 실시간 멀티플레이어 웹 게임 (최대 30명)

## 프로젝트 구조

```
lfd-playground/
├── src/
│   ├── pages/
│   │   ├── Home.tsx           # 메인 페이지
│   │   └── Lobby.tsx          # 게임 대기실
│   ├── games/
│   │   └── liar/              # 라이어게임
│   │       └── index.tsx
│   ├── lib/
│   │   └── supabase.ts        # Supabase 클라이언트
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 기술 스택

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Realtime + Edge Functions)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router Dom

## 개발 명령어

```bash
# 설치
npm install

# 개발 서버 (http://localhost:3000)
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview

# 린팅
npm run lint

# 포맷팅
npm run format
```

## 게임 흐름

1. **메인 페이지** (`/`) - 닉네임 입력 + 숨겨진 관리자 기능 (로고 7회 클릭)
2. **로비** (`/lobby`) - 게임 선택 및 시작 대기
3. **라이어 게임** (`/games/liar`) - 게임 플레이

## 라이어 게임 규칙

- 3명 이상 플레이어 필요
- 한 명이 '라이어'로 지정됨
- 라이어는 주제를 모르고, 나머지는 주제를 알고 있음
- 모든 플레이어가 주제에 대해 설명
- 투표로 라이어 찾기
- 라이어를 찾으면 일반 플레이어 승리, 못 찾으면 라이어 승리

## 개발 정보

- **숨겨진 관리자 기능**: 메인 페이지에서 로고를 7번 클릭하면 관리자 권한 활성화
- **포트**: 3000 (개발 서버)
- **실시간 기능**: Supabase Realtime 사용 (나중에 구현)

## 배포

```bash
npm run build
# dist 폴더를 정적 호스팅 서비스에 업로드
```

## 환경 변수

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 기여

1. 새로운 게임은 `src/games/` 디렉토리에 추가
2. 공통 컴포넌트는 `src/shared/` 디렉토리에 추가 (예정)
3. 코드 스타일은 Prettier + ESLint 설정을 따름