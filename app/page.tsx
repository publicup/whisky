"use client";

import {
  ArrowDown,
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  GlassWater,
  LockKeyhole,
  Martini,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import whiskies from "@/data/whiskies.json";

type Whisky = (typeof whiskies)[number];
type Question = {
  id: "drink" | "aroma" | "method" | "occasion" | "budget";
  title: string;
  subtitle: string;
  options: { label: string; detail: string; value: string }[];
};
type Answers = Partial<Record<Question["id"], string>>;
type SommelierNote = {
  sommelierNote: string;
  hiddenGems: { name: string; reason: string }[];
  specialPairing: string;
};

const questions: Question[] = [
  {
    id: "drink",
    title: "평소 어떤 음료를 즐기세요?",
    subtitle: "익숙한 한 잔에서 취향의 단서를 찾아볼게요.",
    options: [
      { label: "바닐라라떼", detail: "부드럽고 포근한 단맛", value: "vanilla" },
      { label: "산미 있는 아메리카노", detail: "산뜻하고 또렷한 과일감", value: "bright" },
      { label: "에스프레소", detail: "진하고 묵직한 여운", value: "bold" },
      { label: "탄산수", detail: "깔끔하고 드라이한 마무리", value: "crisp" },
    ],
  },
  {
    id: "aroma",
    title: "가장 끌리는 향은 무엇인가요?",
    subtitle: "첫 향만으로도 위스키의 분위기가 달라집니다.",
    options: [
      { label: "초콜릿 · 건과일", detail: "셰리 캐스크의 깊고 달콤한 향", value: "sherry" },
      { label: "캠프파이어 훈연", detail: "바닷바람을 머금은 피트 향", value: "peat" },
      { label: "꽃 · 청사과", detail: "가볍고 싱그러운 과일 향", value: "fruit" },
      { label: "시나몬 · 스파이스", detail: "따뜻하고 알싸한 향신료", value: "spice" },
    ],
  },
  {
    id: "method",
    title: "어떤 방식으로 마시고 싶으세요?",
    subtitle: "오늘의 잔에 어울리는 질감을 골라주세요.",
    options: [
      { label: "온더락", detail: "천천히 열리는 향과 둥근 질감", value: "rocks" },
      { label: "하이볼", detail: "탄산과 함께 가볍고 산뜻하게", value: "highball" },
      { label: "스트레이트 니트", detail: "원액 그대로 깊게 음미하기", value: "neat" },
    ],
  },
  {
    id: "occasion",
    title: "주로 어떤 순간에 즐기시나요?",
    subtitle: "마시는 장면을 떠올리면 추천이 더 정교해져요.",
    options: [
      { label: "조용한 혼술", detail: "나만의 리듬으로 천천히", value: "quiet" },
      { label: "파티 · 모임", detail: "누구나 편히 즐길 수 있는 한 잔", value: "party" },
      { label: "바비큐 · 식사", detail: "음식과 함께 더 맛있게", value: "dining" },
    ],
  },
  {
    id: "budget",
    title: "오늘 생각하는 예산대는요?",
    subtitle: "선택한 예산 안에서 가장 잘 맞는 병을 찾습니다.",
    options: [
      { label: "5~10만", detail: "좋은 입문과 데일리 한 병", value: "5~10만" },
      { label: "10~20만", detail: "개성이 선명한 발견", value: "10~20만" },
      { label: "20만 이상", detail: "기억에 남을 프리미엄", value: "20만+" },
    ],
  },
];

const flavorLabels = ["피트", "달콤함", "과일", "바디감", "스파이시"];
const flavorForTag: Record<string, number[]> = {
  피트: [1, 0, 0, 1, 0],
  셰리: [0, 1, 0, 1, 1],
  바닐라: [0, 1, 0, 0, 0],
  스파이시: [0, 0, 0, 1, 1],
  과일: [0, 0, 1, 0, 0],
};
const aromaTag: Record<string, string> = {
  sherry: "셰리",
  peat: "피트",
  fruit: "과일",
  spice: "스파이시",
};
const fallbackNote: SommelierNote = {
  sommelierNote:
    "잔을 손으로 감싸 향을 천천히 열어 보세요. 첫 향과 한 모금 뒤의 질감, 마지막 여운을 차례로 따라가면 오늘 발견한 취향이 더 또렷해집니다.",
  hiddenGems: [
    { name: "글렌모렌지 오리지널 10년 (가성비 픽)", reason: "산뜻한 과일과 바닐라의 균형이 취향의 폭을 넓혀줍니다." },
    { name: "하이랜드 파크 12년 (프리미엄 픽)", reason: "은은한 피트와 꿀 향이 익숙함과 새로운 매력을 함께 전합니다." },
  ],
  specialPairing: "상온의 물을 몇 방울 더하고 숙성 치즈를 곁들여 향의 변화를 비교해 보세요.",
};

function getRecommendation(answers: Answers): Whisky {
  const selectedBudget = answers.budget ?? "10~20만";
  const selectedAroma = aromaTag[answers.aroma ?? ""];
  const ranked = whiskies
    .map((whisky) => {
      let score = whisky.priceRange === selectedBudget ? 5 : 0;
      if (selectedAroma && whisky.flavorTags.includes(selectedAroma)) score += 8;
      if (answers.drink === "vanilla" && whisky.flavorTags.includes("바닐라")) score += 3;
      if (answers.drink === "bright" && whisky.flavorTags.includes("과일")) score += 3;
      if (answers.drink === "bold" && (whisky.flavorTags.includes("셰리") || whisky.flavorTags.includes("스파이시"))) score += 2;
      if (answers.drink === "crisp" && !whisky.flavorTags.includes("피트")) score += 2;
      if (answers.method === "highball" && whisky.abv >= 43) score += 1;
      if (answers.occasion === "dining" && whisky.flavorTags.includes("스파이시")) score += 1;
      return { whisky, score };
    })
    .sort((first, second) => second.score - first.score);
  return ranked[0].whisky;
}

function getCharacter(answers: Answers) {
  if (answers.aroma === "peat") return "불꽃 곁의 탐험가";
  if (answers.aroma === "sherry") return "깊은 밤의 수집가";
  if (answers.aroma === "spice") return "온도를 즐기는 미식가";
  if (answers.aroma === "fruit") return "싱그러운 향의 발견자";
  if (answers.drink === "vanilla") return "부드러움을 아는 감각가";
  return "취향을 찾아가는 탐험가";
}

function getFlavorScores(whisky: Whisky, answers: Answers) {
  const totals = [0, 0, 0, 0, 0];
  whisky.flavorTags.forEach((tag) => {
    flavorForTag[tag]?.forEach((score, index) => {
      totals[index] += score;
    });
  });
  if (answers.aroma === "peat") totals[0] += 1;
  if (answers.aroma === "sherry") totals[1] += 1;
  if (answers.aroma === "fruit") totals[2] += 1;
  if (answers.aroma === "spice") totals[4] += 1;
  if (answers.method === "neat") totals[3] += 1;
  const maximum = Math.max(...totals, 1);
  return flavorLabels.map((label, index) => ({ label, value: Math.round((totals[index] / maximum) * 92) + 8 }));
}

export default function Home() {
  const [screen, setScreen] = useState<"intro" | "quiz" | "result">("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<string>();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [note, setNote] = useState<SommelierNote>();
  const [loadingNote, setLoadingNote] = useState(false);
  const [copied, setCopied] = useState(false);

  const recommendation = getRecommendation(answers);
  const question = questions[questionIndex];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedAnswers: Answers = {};
    questions.forEach((item) => {
      const value = params.get(item.id);
      if (value && item.options.some((option) => option.value === value)) {
        sharedAnswers[item.id] = value;
      }
    });
    if (questions.every((item) => sharedAnswers[item.id])) {
      setAnswers(sharedAnswers);
      setScreen("result");
    }
  }, []);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0) return;
    let active = true;
    setLoadingNote(true);
    fetch("/api/whiskey-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, recommendation: getRecommendation(answers) }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("AI note request failed");
        return (await response.json()) as SommelierNote;
      })
      .then((result) => {
        if (active) setNote(result);
      })
      .catch(() => {
        if (active) setNote(fallbackNote);
      })
      .finally(() => {
        if (active) {
          setLoadingNote(false);
          setCountdown(null);
        }
      });
    return () => {
      active = false;
    };
  }, [countdown, answers]);

  function chooseOption(value: string) {
    setSelected(value);
    window.setTimeout(() => {
      const nextAnswers = { ...answers, [question.id]: value };
      setAnswers(nextAnswers);
      setSelected(undefined);
      if (questionIndex === questions.length - 1) {
        setScreen("result");
      } else {
        setQuestionIndex(questionIndex + 1);
      }
    }, 180);
  }

  function restart() {
    setScreen("intro");
    setQuestionIndex(0);
    setAnswers({});
    setNote(undefined);
    setCountdown(null);
  }

  async function copyResult() {
    const url = new URL(window.location.href);
    url.searchParams.set("whisky", recommendation.id);
    Object.entries(answers).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function unlockNote() {
    setCountdown(5);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" onClick={restart} aria-label="Malt Room 처음으로">
          <span className="brand-mark"><GlassWater size={18} strokeWidth={1.7} /></span>
          <span>MALT ROOM</span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> YOUR TASTE, IN A GLASS</div>
      </header>

      {screen === "intro" && (
        <section className="intro" id="top">
          <div className="intro-copy">
            <p className="eyebrow"><span /> A PERSONAL WHISKY GUIDE</p>
            <h1>좋아하는 맛에서<br /><em>나만의 위스키</em>를 찾다</h1>
            <p className="intro-description">다섯 가지 질문이면 충분해요.<br />오늘 밤 당신과 잘 어울리는 한 잔을 발견해 보세요.</p>
            <button className="primary-button" onClick={() => setScreen("quiz")}>
              내 취향 위스키 찾기 <ChevronRight size={18} />
            </button>
            <div className="intro-meta"><span>01</span> 약 1분 <i /> 취향에 맞는 추천 <i /> 무료</div>
          </div>
          <div className="intro-image" role="img" aria-label="나무 바 테이블 위에 놓인 위스키 잔">
            <div className="image-caption"><span>TONIGHT&apos;S POUR</span><strong>Make it yours.</strong></div>
            <div className="image-stamp">EST.<br /><b>YOUR<br />TASTE</b></div>
          </div>
          <div className="intro-bottom"><span>01 / DISCOVER</span><ArrowDown size={16} /><span>SCROLL TO BEGIN</span></div>
        </section>
      )}

      {screen === "quiz" && (
        <section className="quiz-page">
          <div className="quiz-topline">
            <button className="icon-button" onClick={() => questionIndex === 0 ? setScreen("intro") : setQuestionIndex(questionIndex - 1)} aria-label="이전 단계"><ArrowLeft size={18} /></button>
            <span>YOUR TASTE PROFILE</span>
            <span className="step-count">{String(questionIndex + 1).padStart(2, "0")} <i>/</i> 05</span>
          </div>
          <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
          <div className="question-heading" key={question.id}>
            <p className="eyebrow">QUESTION {String(questionIndex + 1).padStart(2, "0")}</p>
            <h1>{question.title}</h1>
            <p>{question.subtitle}</p>
          </div>
          <div className="option-list" key={`options-${question.id}`}>
            {question.options.map((option, index) => (
              <button className={`option-card ${selected === option.value ? "is-selected" : ""}`} key={option.value} onClick={() => chooseOption(option.value)}>
                <span className="option-index">0{index + 1}</span>
                <span className="option-text"><strong>{option.label}</strong><small>{option.detail}</small></span>
                <span className="option-check">{selected === option.value ? <Check size={17} /> : <ChevronRight size={17} />}</span>
              </button>
            ))}
          </div>
          <p className="quiz-footnote"><LockKeyhole size={13} /> 답변은 추천을 만드는 데만 사용돼요.</p>
        </section>
      )}

      {screen === "result" && (
        <section className="results-page">
          <div className="result-heading">
            <p className="eyebrow"><span /> YOUR WHISKY PROFILE</p>
            <div className="result-title-row"><div><p className="result-kicker">YOUR CHARACTER</p><h1>{getCharacter(answers)}</h1></div><span className="profile-seal"><Sparkles size={21} /><small>PERSONAL<br />PROFILE</small></span></div>
            <p className="result-intro">취향의 단서를 모아 오늘의 한 잔을 골랐어요.<br />당신의 감각에 잘 어울리는 첫 번째 추천입니다.</p>
          </div>

          <div className="result-grid">
            <section className="panel flavor-panel">
              <div className="panel-heading"><div><span className="section-index">01</span><h2>MY FLAVOR MAP</h2></div><span className="panel-caption">TASTE PROFILE</span></div>
              <div className="flavor-list">
                {getFlavorScores(recommendation, answers).map((flavor) => (
                  <div className="flavor-row" key={flavor.label}><span>{flavor.label}</span><div className="flavor-track"><span style={{ width: `${flavor.value}%` }} /></div><b>{flavor.value}</b></div>
                ))}
              </div>
              <p className="panel-note">취향 응답과 추천 위스키의 풍미 태그를 바탕으로 한 예상치예요.</p>
            </section>

            <section className="panel recommendation-panel">
              <div className="panel-heading"><div><span className="section-index">02</span><h2>YOUR FIRST POUR</h2></div><span className="match-label">TOP MATCH</span></div>
              <div className="whisky-card">
                <div className="bottle-art" aria-hidden="true"><div className="bottle-neck" /><div className="bottle-body"><span>MALT<br />ROOM</span><i /></div><div className="bottle-shadow" /></div>
                <div className="whisky-info"><span className="category-label">{recommendation.category} <i /> {recommendation.priceRange}원대</span><h3>{recommendation.name}</h3><p className="abv">ABV <strong>{recommendation.abv}%</strong></p></div>
              </div>
              <p className="whisky-description">{recommendation.description}</p>
              <div className="pairing-line"><Martini size={16} /><div><span>첫 페어링</span><strong>{recommendation.pairingFood}</strong></div></div>
              <div className="flavor-tags">{recommendation.flavorTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </section>
          </div>

          <section className={`premium-section ${note ? "is-unlocked" : ""}`}>
            {!note ? (
              <div className="premium-locked">
                <div className="premium-icon"><LockKeyhole size={19} /></div>
                <div className="premium-copy"><span className="premium-overline">A LITTLE MORE PERSONAL</span><h2>AI 소믈리에의 1:1 시음 노트<br className="desktop-break" /> &amp; 숨은 명주 2종</h2><p>당신의 답변을 바탕으로 완성하는 개인 시음 가이드</p></div>
                <button className="unlock-button" onClick={unlockNote}><Sparkles size={16} /> 짧은 안내(5초) 보고 무료로 열기 <ChevronRight size={16} /></button>
              </div>
            ) : (
              <div className="premium-open">
                <div className="panel-heading"><div><span className="section-index">03</span><h2>AI SOMMELIER NOTE</h2></div><span className="unlocked-label"><Sparkles size={13} /> UNLOCKED</span></div>
                <p className="sommelier-note">{note.sommelierNote}</p>
                <div className="hidden-gems"><h3>당신을 위한 숨은 명주</h3><div className="gem-grid">{note.hiddenGems.map((gem) => <article className="gem-item" key={gem.name}><span><Sparkles size={14} /></span><div><h4>{gem.name}</h4><p>{gem.reason}</p></div></article>)}</div></div>
                <div className="special-tip"><Martini size={17} /><div><span>SPECIAL PAIRING</span><p>{note.specialPairing}</p></div></div>
              </div>
            )}
          </section>

          <section className="gear-strip">
            <div className="gear-icon"><GlassWater size={22} /></div><div className="gear-copy"><span>THE RIGHT GLASS, THE RIGHT MOMENT</span><h2>한 잔의 경험을 완성하는 도구</h2><p>글렌캐런 글라스 · 천천히 녹는 아이스볼 틀</p></div><a href="https://search.shopping.naver.com/search/all?query=%EA%B8%80%EB%A0%8C%EC%BA%90%EB%9F%B0%20%EC%9E%94" target="_blank" rel="noreferrer">추천 제품 보기 <ChevronRight size={15} /></a>
          </section>

          <div className="result-actions"><button className="secondary-button" onClick={copyResult}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "링크가 복사됐어요" : "결과 링크 복사"}</button><button className="text-button" onClick={restart}><RotateCcw size={15} /> 다시 하기</button></div>
          <p className="responsibility-note">위스키는 성인만 즐길 수 있습니다. 책임 있는 음주를 권합니다.</p>
        </section>
      )}

      <footer className="site-footer"><span>© 2026 MALT ROOM</span><span>MADE FOR YOUR NEXT POUR</span></footer>

      {countdown !== null && (
        <div className="modal-backdrop" role="presentation">
          <section className="countdown-modal" role="dialog" aria-modal="true" aria-labelledby="countdown-title">
            <button className="modal-close" aria-label="닫기" onClick={() => setCountdown(null)}><X size={18} /></button>
            {loadingNote ? <div className="loader-ring" /> : <div className="countdown-number">{countdown}</div>}
            <p className="eyebrow">YOUR PERSONAL POUR</p>
            <h2 id="countdown-title">AI가 맞춤 시음 노트를<br />조합 중입니다...</h2>
            <p>취향을 한 잔의 언어로 옮기고 있어요.</p>
            <div className="modal-progress"><span style={{ width: `${loadingNote ? 100 : ((5 - countdown) / 5) * 100}%` }} /></div>
            <span className="modal-status">{loadingNote ? "노트를 준비하고 있어요" : "잠시만 기다려 주세요"}</span>
          </section>
        </div>
      )}
    </main>
  );
}