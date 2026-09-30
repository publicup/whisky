# MALT ROOM

다섯 가지 취향 질문으로 로컬 위스키 데이터를 즉시 추천하고, 5초 카운트다운 뒤 Gemini 기반 개인 시음 노트를 여는 Next.js App Router 앱입니다.

## 단계별 구성

1. `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`에서 Next.js 15, TypeScript, App Router, Tailwind CSS를 설정합니다.
2. `data/whiskies.json`의 18종 정적 데이터를 무료 1차 추천에 사용합니다.
3. `app/api/whiskey-ai/route.ts`에서 `gemini-2.5-flash`를 호출하고, 키 누락·호출 실패·잘못된 응답에는 기본 노트를 반환합니다.
4. `app/page.tsx`와 `app/globals.css`에서 5문항 설문, 추천 결과, 5초 잠금 해제, 복사 및 재시작 UI를 제공합니다.

## 설치 및 실행

```bash
npm install
npm install lucide-react
npm install @google/genai
cp .env.example .env.local
npm run dev
```

Gemini 프리미엄 노트를 실제 생성하려면 `.env.local`에 `GEMINI_API_KEY`를 설정하세요. 키가 없어도 설문과 무료 추천, 고정 fallback 시음 노트는 동작합니다.

개발 서버: [http://localhost:3000](http://localhost:3000)# whisky