import React, { useRef, useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";
import MainLayout from "./components/MainLayout";
import ResultDisplay from "./components/ResultDisplay";
import HowItWorks from "./components/HowItWorks";
import AdBox from "./components/AdBox";
import { useTranslation } from "react-i18next";
import {
  sanitizeInput,
  validateInput,
  isValidDebateType,
} from "./utils/security";
import womanImg from "./assets/woman.png";
import manImg from "./assets/man.png";

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
  },
  {
    key: "friends",
    label: "Friends",
    answerALabel: "Friend A's opinion",
    answerBLabel: "Friend B's opinion",
    answerAPlaceholder: "Write Friend A's side...",
    answerBPlaceholder: "Write Friend B's side...",
  },
  {
    key: "mom_and_child",
    label: "Mom and Child",
    answerALabel: "Mom's view",
    answerBLabel: "Child's view",
    answerAPlaceholder: "Write Mom's side...",
    answerBPlaceholder: "Write Child's side...",
  },
  {
    key: "siblings",
    label: "Siblings",
    answerALabel: "Sibling A's view",
    answerBLabel: "Sibling B's view",
    answerAPlaceholder: "Write Sibling A's side...",
    answerBPlaceholder: "Write Sibling B's side...",
  },
  {
    key: "co_workers",
    label: "Co-Workers",
    answerALabel: "Co-worker A's view",
    answerBLabel: "Co-worker B's view",
    answerAPlaceholder: "Write Co-worker A's side...",
    answerBPlaceholder: "Write Co-worker B's side...",
  },
  {
    key: "boss_and_employee",
    label: "Boss and Employee",
    answerALabel: "Boss's view",
    answerBLabel: "Employee's view",
    answerAPlaceholder: "Write Boss's side...",
    answerBPlaceholder: "Write Employee's side...",
  },
];

interface MainAppProps {
  t: (key: string, fallback?: string) => string;
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
  answerALabel,
  answerBLabel,
  answerAPlaceholder,
  answerBPlaceholder,
  handleSubmit,
  handleClear,
  resultRef,
  QUESTION_MAX,
  ANSWER_MAX,
}) => (
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
    {/* User type selection buttons */}
    <div className="flex flex-row flex-wrap gap-3 justify-center mb-6">
      {userTypes.map((typeObj) => (
        <button
          key={typeObj.key}
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
        src={womanImg}
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
        src={manImg}
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
    {saveStatus && (
      <div className="px-4 py-2">
        {saveStatus === "success" ? (
          <div className="text-green-400 text-sm">
            {t("saveSuccess", "Debate saved successfully!")}
          </div>
        ) : (
          <div className="text-red-400 text-sm">
            {saveError || t("saveError", "Failed to save debate")}
          </div>
        )}
      </div>
    )}
    {(result || loading) && <ResultDisplay result={result} loading={loading} />}
    {/* Ad after result */}
    {result && (
      <div className="px-4 py-6">
        <AdBox adSlot="YOUR_AD_SLOT_ID" className="max-w-4xl mx-auto" />
      </div>
    )}
    <div ref={resultRef} />
  </div>
);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Track page view on app load
  useEffect(() => {
    logEvent(analytics, "page_view", {
      page_title: "Who is Right?",
      page_location: window.location.href,
      language: i18n.language,
    });
  }, [i18n.language]);
  const [question, setQuestion] = useState("");
  const [answerA, setAnswerA] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [result, setResult] = useState<string | null>(null);
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
      });
      return;
    }

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
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
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSaveStatus("error");
        setSaveError(data.error || "Failed to save debate");
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
          question_length: question.length,
          answer_a_length: answerA.length,
          answer_b_length: answerB.length,
        });
        // Scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err.message || "Failed to save debate");
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
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
