import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  Suspense,
  lazy,
} from "react";
import { TFunction } from "i18next";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";
import MainLayout from "./components/MainLayout";
import Switch from "./components/Switch";

// Lazy load components for better performance
const ResultDisplay = lazy(() => import("./components/ResultDisplay"));
const HowItWorks = lazy(() => import("./components/HowItWorks"));
const AmazonRecommendations = lazy(
  () => import("./components/AmazonRecommendations")
);
import { useTranslation } from "react-i18next";
import {
  sanitizeInput,
  validateInput,
  isValidDebateType,
} from "./utils/security";
import gsap from "gsap";
import womanImg from "./assets/optimized/woman.webp";
import manImg from "./assets/optimized/man.webp";
import kidImg from "./assets/optimized/kid_final.webp";
import momImg from "./assets/optimized/mom_no_bg.webp";
import simbling1Img from "./assets/optimized/simbling1_final.webp";
import simbling2Img from "./assets/optimized/simbling2_no_bg.webp";
import bossImg from "./assets/optimized/boss_final.webp";
import employeeImg from "./assets/optimized/employee_final.webp";
import friend1Img from "./assets/optimized/friend1_final.webp";
import friend2Img from "./assets/optimized/friend2_final.webp";
import coWorker1Img from "./assets/optimized/co-worker1_final.webp";
import coWorker2Img from "./assets/optimized/co-worker2_final.webp";

const QUESTION_MAX = 500;
const ANSWER_MAX = 300;
const MIN_LENGTH = 5;
const DAILY_LIMIT = 15;

// Daily usage limit helpers
const checkDailyLimit = () => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem("dailyUsage") || "{}");

  if (usage.date !== today) {
    // Reset for new day
    localStorage.setItem(
      "dailyUsage",
      JSON.stringify({ date: today, count: 0 })
    );
    return true;
  }

  return usage.count < DAILY_LIMIT;
};

const incrementUsage = () => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem("dailyUsage") || "{}");

  if (usage.date !== today) {
    usage.date = today;
    usage.count = 0;
  }

  usage.count++;
  localStorage.setItem("dailyUsage", JSON.stringify(usage));
};

const getRemainingUses = () => {
  const usage = JSON.parse(localStorage.getItem("dailyUsage") || "{}");
  const today = new Date().toDateString();

  if (usage.date !== today) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - usage.count);
};

const userTypes = [
  {
    key: "couple",
    label: "Couple",
    answerALabel: "What she thinks",
    answerBLabel: "What he thinks",
    answerAPlaceholder: "Write her side of the story...",
    answerBPlaceholder: "Write his side of the story...",
    imageA: womanImg,
    imageB: manImg,
  },
  {
    key: "friends",
    label: "Friends",
    answerALabel: "Friend A's opinion",
    answerBLabel: "Friend B's opinion",
    answerAPlaceholder: "Write Friend A's side...",
    answerBPlaceholder: "Write Friend B's side...",
    imageA: friend1Img,
    imageB: friend2Img,
  },
  {
    key: "mom_and_child",
    label: "Mom and Child",
    answerALabel: "Mom's view",
    answerBLabel: "Child's view",
    answerAPlaceholder: "Write Mom's side...",
    answerBPlaceholder: "Write Child's side...",
    imageA: momImg,
    imageB: kidImg,
  },
  {
    key: "siblings",
    label: "Siblings",
    answerALabel: "Sibling A's view",
    answerBLabel: "Sibling B's view",
    answerAPlaceholder: "Write Sibling A's side...",
    answerBPlaceholder: "Write Sibling B's side...",
    imageA: simbling1Img,
    imageB: simbling2Img,
  },
  {
    key: "co_workers",
    label: "Co-Workers",
    answerALabel: "Co-worker A's view",
    answerBLabel: "Co-worker B's view",
    answerAPlaceholder: "Write Co-worker A's side...",
    answerBPlaceholder: "Write Co-worker B's side...",
    imageA: coWorker1Img,
    imageB: coWorker2Img,
  },
  {
    key: "boss_and_employee",
    label: "Boss and Employee",
    answerALabel: "Boss's view",
    answerBLabel: "Employee's view",
    answerAPlaceholder: "Write Boss's side...",
    answerBPlaceholder: "Write Employee's side...",
    imageA: bossImg,
    imageB: employeeImg,
  },
];

interface MainAppProps {
  t: TFunction;
  i18n: any;
  question: string;
  setQuestion: (value: string) => void;
  answerA: string;
  setAnswerA: (value: string) => void;
  answerB: string;
  setAnswerB: (value: string) => void;
  result: string | null;
  loading: boolean;
  errors: { question?: string; answerA?: string; answerB?: string };
  saveStatus: null | "success" | "error";
  saveError: string | null;
  selectedType: string;
  setSelectedType: (value: string) => void;
  answerTone: "funny" | "serious";
  setAnswerTone: (value: "funny" | "serious") => void;
  selectedTypeObj: (typeof userTypes)[0];
  answerALabel: string;
  answerBLabel: string;
  answerAPlaceholder: string;
  answerBPlaceholder: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleClear: () => void;
  resultRef: React.RefObject<HTMLDivElement>;
  QUESTION_MAX: number;
  ANSWER_MAX: number;
}

const MainApp: React.FC<MainAppProps> = ({
  t,
  i18n,
  question,
  setQuestion,
  answerA,
  setAnswerA,
  answerB,
  setAnswerB,
  result,
  loading,
  errors,
  saveStatus,
  saveError,
  selectedType,
  setSelectedType,
  answerTone,
  setAnswerTone,
  selectedTypeObj,
  answerALabel,
  answerBLabel,
  answerAPlaceholder,
  answerBPlaceholder,
  handleSubmit,
  handleClear,
  resultRef,
  QUESTION_MAX,
  ANSWER_MAX,
}) => {
  const typesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!typesRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(typesRef.current!.children, {
        opacity: 0,
        y: 12,
        scale: 0.96,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all",
      });
    }, typesRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const btn = document.querySelector<HTMLButtonElement>(
      `button[data-type="${selectedType}"]`
    );
    if (btn) {
      gsap.fromTo(
        btn,
        { scale: 0.98 },
        { scale: 1, duration: 0.18, ease: "back.out(2)" }
      );
    }
  }, [selectedType]);

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 mx-auto w-full">
      <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-2 pt-3">
        {t("appName", "Settle the score")}
      </h2>
      <p className="text-gray-300 text-sm text-center px-4 pb-4">
        {t(
          "appDescription",
          "Get AI-powered analysis to settle any argument or debate"
        )}
      </p>
      <div className="w-full flex justify-center px-4 pb-4">
        <Switch
          label={t("toneLabel", "Type of answer")}
          options={[
            { label: t("toneFunny", "Funny"), value: "funny" },
            { label: t("toneSerious", "Serious"), value: "serious" },
          ]}
          value={answerTone}
          onChange={(val) => setAnswerTone(val as "funny" | "serious")}
        />
      </div>
      {/* User type selection buttons */}
      <div
        ref={typesRef}
        className="flex flex-row flex-wrap gap-3 justify-center mb-6"
      >
        {userTypes.map((typeObj) => (
          <button
            key={typeObj.key}
            data-type={typeObj.key}
            type="button"
            className={`px-4 py-2 rounded-full font-semibold shadow focus:outline-none bg-[#293a42] text-white hover:bg-[#35505c] ${
              selectedType === typeObj.key
                ? "ring-2 ring-[#add6ea] bg-[#35505c]"
                : ""
            }`}
            onClick={() => {
              setSelectedType(typeObj.key);
              // Track user type selection
              logEvent(analytics, "user_type_selected", {
                user_type: typeObj.key,
                language: i18n.language,
              });
            }}
          >
            {t(`userTypeLabel.${typeObj.key}`, typeObj.label)}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-wrap flex-col direction items-start px-4">
          <label
            htmlFor="question-input"
            className="block text-white text-base font-medium mb-1"
          >
            {t("questionLabel", "What's the argument about?")}
          </label>
          <textarea
            id="question-input"
            placeholder={t("questionPlaceholder", "Enter the question...")}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#293a42] focus:border-none min-h-24 placeholder:text-[#9ab4c1] p-4 text-base font-normal leading-normal"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={QUESTION_MAX}
          />
          <div
            className={`text-xs text-right self-end mt-1 ${
              question.length > QUESTION_MAX ? "text-red-400" : "text-gray-400"
            }`}
          >
            {question.length} / {QUESTION_MAX}
          </div>
          {errors.question && (
            <div className="text-red-400 text-sm mt-1 w-full">
              {errors.question}
            </div>
          )}
        </div>
      </form>
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        {t("tellYourSide", "Tell your side of the story")}
      </h2>
      <div className="flex flex-wrap items-center gap-4 px-4 py-2">
        <img
          src={selectedTypeObj.imageA}
          alt={t("herMessage", "Her avatar")}
          className="w-24 h-24 object-contain mr-3 md:w-48 md:h-48"
        />
        <div className="flex-1 w-full">
          <label
            htmlFor="answerA"
            className="block text-white text-base font-medium mb-1 w-full"
          >
            {answerALabel}
          </label>
          <textarea
            id="answerA"
            placeholder={answerAPlaceholder}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#293a42] focus:border-none min-h-24 placeholder:text-[#9ab4c1] p-4 text-base font-normal leading-normal"
            value={answerA}
            onChange={(e) => setAnswerA(e.target.value)}
            maxLength={ANSWER_MAX}
          />
          <div
            className={`text-xs text-right mt-1 ${
              answerA.length > ANSWER_MAX ? "text-red-400" : "text-gray-400"
            }`}
          >
            {answerA.length} / {ANSWER_MAX}
          </div>
          {errors.answerA && (
            <div className="text-red-400 text-sm mt-1 w-full">
              {errors.answerA}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 py-2">
        <div className="flex-1 w-full">
          <label
            htmlFor="answerB"
            className="block text-white text-base font-medium mb-1 w-full"
          >
            {answerBLabel}
          </label>
          <textarea
            id="answerB"
            placeholder={answerBPlaceholder}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#293a42] focus:border-none min-h-24 placeholder:text-[#9ab4c1] p-4 text-base font-normal leading-normal"
            value={answerB}
            onChange={(e) => setAnswerB(e.target.value)}
            maxLength={ANSWER_MAX}
          />
          <div
            className={`text-xs text-right mt-1 ${
              answerB.length > ANSWER_MAX ? "text-red-400" : "text-gray-400"
            }`}
          >
            {answerB.length} / {ANSWER_MAX}
          </div>
          {errors.answerB && (
            <div className="text-red-400 text-sm mt-1 w-full">
              {errors.answerB}
            </div>
          )}
        </div>
        <img
          src={selectedTypeObj.imageB}
          alt={t("hisMessage", "His avatar")}
          className="w-24 h-24 object-contain mr-3 md:w-48 md:h-48"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 py-2">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-[#add6ea] text-[#131c20] md:text-base text-[0.9rem] px-6 py-3 rounded-full font-semibold hover:bg-[#8bc4d8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("loading", "Checking...") : t("submit", "Who is right?")}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 bg-[#293a42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#35505c]"
        >
          {t("clear", "Clear")}
        </button>
      </div>
      <div ref={resultRef} />

      {(result || loading) && (
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
                fontSize: "16px",
                color: "#666",
              }}
            >
              Loading result...
            </div>
          }
        >
          <ResultDisplay result={result} loading={loading} />
        </Suspense>
      )}

      {/* Amazon Recommendations */}
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
              fontSize: "16px",
              color: "#666",
            }}
          >
            Loading recommendations...
          </div>
        }
      >
        <AmazonRecommendations selectedType={selectedType} />
      </Suspense>
    </div>
  );
};

// Component to handle dynamic canonical URLs
const CanonicalURL: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = `https://whoisright.app${location.pathname}`;
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;
  }, [location.pathname]);

  return null;
};

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Track page view and user engagement on app load
  useEffect(() => {
    const startTime = Date.now();

    logEvent(analytics, "page_view", {
      page_title: "Who is Right?",
      page_location: window.location.href,
      language: i18n.language,
    });

    // Track scroll depth
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollDepth > 25 && scrollDepth <= 50) {
        logEvent(analytics, "scroll_depth", {
          depth_percentage: 25,
          language: i18n.language,
        });
      } else if (scrollDepth > 50 && scrollDepth <= 75) {
        logEvent(analytics, "scroll_depth", {
          depth_percentage: 50,
          language: i18n.language,
        });
      } else if (scrollDepth > 75) {
        logEvent(analytics, "scroll_depth", {
          depth_percentage: 75,
          language: i18n.language,
        });
      }
    };

    // Track time spent on page
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      logEvent(analytics, "time_spent", {
        time_seconds: timeSpent,
        language: i18n.language,
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [i18n.language]);
  const [question, setQuestion] = useState("");
  const [answerA, setAnswerA] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [answerTone, setAnswerTone] = useState<"funny" | "serious">("serious");
  const [result, setResult] = useState<string | null>(null);
  // const [result, setResult] = useState<string | null>(
  //   `OK. Vamos lá! **Situação:** A filha saiu do emprego dois meses antes do intercâmbio, e a mãe não está feliz. **Mon:** A mãe acha um absurdo porque a filha vai se atrasar muito, tem que ir ao médico, visitar a família e arrumar as coisas. **Child:** A filha acha completamente possível, porque durante a semana pode arrumar as coisas e ir ao médico, e nos finais de semana visitar quem ela quer. **O Veredicto:** Hum... Analisando as evidências... A filha parece ter uma agenda mais apertada que a de um malabarista em um vulcão! Mas, a mãe tem um ponto: as tarefas se acumulam como roupa suja em dia de chuva. Declaro: A mãe está meio certa, a filha está meio certa, e o tempo dirá quem vai ter mais dor de cabeça. Boa sorte com o próximo intercâmbio! "`
  // );
  // const [result, setResult] = useState<string | null>(
  //   'Aqui está! **Situação:** Isac recebeu uma mensagem suspeita no relógio e Glau se irritou. **Glau:** Eu vi que Dhayane mandou "bom dia gatão" para o meu amor. Então comecei a bater no Isac, porque ele não pode flertar com outras. **Isac:** Glau tem que deixar de ser egoísta. Primeiro, nem era Dhayane, era Dhannyel, um cliente de uma plataforma que estou montando... apanhei à toa. **O Veredicto:** Hum... Parece que houve um pequeno mal-entendido. A mensagem "bom dia gatão" por si só é um pouco suspeita, mas o nome Dhannyel e a explicação do cliente... Isac, você se safou dessa vez. Glau, acho que você exagerou um pouquinho. Acredito que seja um empate técnico, mas Isac, fique esperto com esses "Dhannyels" por aí. Boa sorte com o jantar! "'
  // );
  // const [result, setResult] = useState<string | null>(
  //   'Okay, entendi! Vamos lá para mais um julgamento divertido! **Situação:** Isac recebe uma mensagem suspeita e Glau reage. **Glau:** Eu vi que Dhayane mandou "bom dia gatão" para o meu amor. Comecei a bater no Isac, porque ele não pode flertar com outras! **Isac:** Glau tem que parar com essa paranoia! Primeiro, nem era Dhayane, era Dhannyel, um cliente da plataforma que estou montando... Levei umas boas porrada à toa. **O Veredicto:** A corte, após análise minuciosa, decide que... a Glau está "um pouquinho" errada. Afinal, parece que a Dhayane/Dhannyel era mais inofensivo que um filhote de hamster. Mas, Isac, use a sabedoria: da próxima vez, explique antes de a mensagem aparecer, para evitar as "homenagens" da Glau. Boa sorte com o jantar!'
  // );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    question?: string;
    answerA?: string;
    answerB?: string;
  }>({});
  const [saveStatus, setSaveStatus] = useState<null | "success" | "error">(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(userTypes[0].key);
  const resultRef = useRef<HTMLDivElement>(null);

  const selectedTypeObj = useMemo(
    () => userTypes.find((t) => t.key === selectedType) || userTypes[0],
    [selectedType]
  );

  // Memoize the label and placeholder values
  const answerALabel = useMemo(
    () =>
      t(`answerALabel.${selectedTypeObj.key}`, selectedTypeObj.answerALabel),
    [t, selectedTypeObj.key, selectedTypeObj.answerALabel]
  );

  const answerBLabel = useMemo(
    () =>
      t(`answerBLabel.${selectedTypeObj.key}`, selectedTypeObj.answerBLabel),
    [t, selectedTypeObj.key, selectedTypeObj.answerBLabel]
  );

  const answerAPlaceholder = useMemo(
    () =>
      t(
        `answerAPlaceholder.${selectedTypeObj.key}`,
        selectedTypeObj.answerAPlaceholder
      ),
    [t, selectedTypeObj.key, selectedTypeObj.answerAPlaceholder]
  );

  const answerBPlaceholder = useMemo(
    () =>
      t(
        `answerBPlaceholder.${selectedTypeObj.key}`,
        selectedTypeObj.answerBPlaceholder
      ),
    [t, selectedTypeObj.key, selectedTypeObj.answerBPlaceholder]
  );

  const validate = () => {
    const errs: typeof errors = {};

    // Validate and sanitize question
    const sanitizedQuestion = sanitizeInput(question);
    if (!sanitizedQuestion.trim())
      errs.question = t("required", { field: t("questionLabel") });
    else if (!validateInput(sanitizedQuestion, QUESTION_MAX, MIN_LENGTH))
      errs.question = t("minLength", {
        field: t("questionLabel"),
        min: MIN_LENGTH,
      });

    // Validate and sanitize answerA
    const sanitizedAnswerA = sanitizeInput(answerA);
    if (!sanitizedAnswerA.trim())
      errs.answerA = t("required", { field: t("herMessage") });
    else if (!validateInput(sanitizedAnswerA, ANSWER_MAX, MIN_LENGTH))
      errs.answerA = t("minLength", {
        field: t("herMessage"),
        min: MIN_LENGTH,
      });

    // Validate and sanitize answerB
    const sanitizedAnswerB = sanitizeInput(answerB);
    if (!sanitizedAnswerB.trim())
      errs.answerB = t("required", { field: t("hisMessage") });
    else if (!validateInput(sanitizedAnswerB, ANSWER_MAX, MIN_LENGTH))
      errs.answerB = t("minLength", {
        field: t("hisMessage"),
        min: MIN_LENGTH,
      });

    // Validate debate type
    if (!isValidDebateType(selectedType)) {
      errs.question = "Invalid debate type selected";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setSaveError(null);

    // Check daily limit before proceeding
    if (!checkDailyLimit()) {
      setResult(
        t(
          "dailyLimitExceeded",
          "Daily limit reached. You've used all 15 free debates today. Please try again tomorrow! Or contact me on contact button"
        )
      );
      setLoading(false);
      // Track daily limit exceeded
      logEvent(analytics, "daily_limit_exceeded", {
        user_type: selectedType,
        language: i18n.language,
        tone: answerTone,
      });
      return;
    }

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Track validation errors
      logEvent(analytics, "validation_error", {
        error_fields: Object.keys(errs),
        user_type: selectedType,
        language: i18n.language,
        tone: answerTone,
        question_length: question.length,
        answer_a_length: answerA.length,
        answer_b_length: answerB.length,
      });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "https://savedebate-srwl4n57ga-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: sanitizeInput(question),
            answerA: sanitizeInput(answerA),
            answerB: sanitizeInput(answerB),
            type: selectedType,
            language: i18n.language,
            tone: answerTone,
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSaveStatus("error");
        setSaveError(data.error || "Failed to save debate");

        // Track API error
        logEvent(analytics, "api_error", {
          error_type: "http_error",
          status_code: response.status,
          error_message: data.error || "Unknown error",
          user_type: selectedType,
          language: i18n.language,
          tone: answerTone,
        });
      } else {
        const data = await response.json();
        setSaveStatus("success");
        setSaveError(null);
        setResult(data.verdict || t("resultPlaceholder"));
        // Increment usage only on successful submission
        incrementUsage();
        // Track successful submission
        logEvent(analytics, "debate_submitted", {
          user_type: selectedType,
          language: i18n.language,
          tone: answerTone,
          question_length: question.length,
          answer_a_length: answerA.length,
          answer_b_length: answerB.length,
        });
        // Scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err.message || "Failed to save debate");

      // Track network/other errors
      logEvent(analytics, "api_error", {
        error_type: "network_error",
        error_message: err.message || "Unknown error",
        user_type: selectedType,
        language: i18n.language,
        tone: answerTone,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setAnswerA("");
    setAnswerB("");
    setResult(null);
    setErrors({});
    // Track form clear
    logEvent(analytics, "form_cleared", {
      user_type: selectedType,
      language: i18n.language,
    });
  };

  return (
    <Router>
      <CanonicalURL />
      <MainLayout>
        <Routes>
          <Route
            path="/"
            element={
              <MainApp
                t={t}
                i18n={i18n}
                question={question}
                setQuestion={setQuestion}
                answerA={answerA}
                setAnswerA={setAnswerA}
                answerB={answerB}
                setAnswerB={setAnswerB}
                result={result}
                loading={loading}
                errors={errors}
                saveStatus={saveStatus}
                saveError={saveError}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                answerTone={answerTone}
                setAnswerTone={setAnswerTone}
                selectedTypeObj={selectedTypeObj}
                answerALabel={answerALabel}
                answerBLabel={answerBLabel}
                answerAPlaceholder={answerAPlaceholder}
                answerBPlaceholder={answerBPlaceholder}
                handleSubmit={handleSubmit}
                handleClear={handleClear}
                resultRef={resultRef}
                QUESTION_MAX={QUESTION_MAX}
                ANSWER_MAX={ANSWER_MAX}
              />
            }
          />
          <Route
            path="/how-it-works"
            element={
              <Suspense
                fallback={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "200px",
                      fontSize: "18px",
                      color: "#666",
                    }}
                  >
                    Loading...
                  </div>
                }
              >
                <HowItWorks />
              </Suspense>
            }
          />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
