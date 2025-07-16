import React, { useRef, useState } from "react";
import MainLayout from "./components/MainLayout";
import ResultDisplay from "./components/ResultDisplay";
import { useTranslation } from "react-i18next";
import womanImg from "./assets/woman.png";
import manImg from "./assets/man.png";

const QUESTION_MAX = 500;
const ANSWER_MAX = 300;
const MIN_LENGTH = 5;

const App: React.FC = () => {
  const { t } = useTranslation();
  const userTypes = [
    { key: "couple", label: "Couple" },
    { key: "friends", label: "Friends" },
    { key: "mom_and_child", label: "Mom and Child" },
    { key: "siblings", label: "Siblings" },
    { key: "co_workers", label: "Co-Workers" },
    { key: "boss_and_employee", label: "Boss and Employee" },
  ];
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

  const validate = () => {
    const errs: typeof errors = {};
    if (!question.trim())
      errs.question = t("required", { field: t("questionLabel") });
    else if (question.length < MIN_LENGTH)
      errs.question = t("minLength", {
        field: t("questionLabel"),
        min: MIN_LENGTH,
      });
    else if (question.length > QUESTION_MAX)
      errs.question = t("maxLength", {
        field: t("questionLabel"),
        max: QUESTION_MAX,
      });
    if (!answerA.trim())
      errs.answerA = t("required", { field: t("herMessage") });
    else if (answerA.length < MIN_LENGTH)
      errs.answerA = t("minLength", {
        field: t("herMessage"),
        min: MIN_LENGTH,
      });
    else if (answerA.length > ANSWER_MAX)
      errs.answerA = t("maxLength", {
        field: t("herMessage"),
        max: ANSWER_MAX,
      });
    if (!answerB.trim())
      errs.answerB = t("required", { field: t("hisMessage") });
    else if (answerB.length < MIN_LENGTH)
      errs.answerB = t("minLength", {
        field: t("hisMessage"),
        min: MIN_LENGTH,
      });
    else if (answerB.length > ANSWER_MAX)
      errs.answerB = t("maxLength", {
        field: t("hisMessage"),
        max: ANSWER_MAX,
      });
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setSaveError(null);
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
            question,
            answerA,
            answerB,
            type: selectedType,
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
  };

  return (
    <MainLayout>
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1 mx-auto w-full">
        <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-3">
          {t("appName", "Settle the score")}
        </h2>
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
              onClick={() => setSelectedType(typeObj.key)}
            >
              {typeObj.label}
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
              placeholder={t(
                "questionPlaceholder",
                "Enter the couple's question..."
              )}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#293a42] focus:border-none min-h-24 placeholder:text-[#9ab4c1] p-4 text-base font-normal leading-normal"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={QUESTION_MAX}
            />
            <div
              className={`text-xs text-right self-end mt-1 ${
                question.length > QUESTION_MAX
                  ? "text-red-400"
                  : "text-gray-400"
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
              htmlFor="her-story"
              className="block text-white text-base font-medium mb-1 w-full"
            >
              {t("herStoryLabel", "What she thinks about it...")}
            </label>
            <textarea
              id="her-story"
              placeholder={t(
                "herStoryPlaceholder",
                "Write her side of the story..."
              )}
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
              htmlFor="his-story"
              className="block text-white text-base font-medium mb-1 w-full"
            >
              {t("hisStoryLabel", "What he thinks about it...")}
            </label>
            <textarea
              id="his-story"
              placeholder={t(
                "hisStoryPlaceholder",
                "Write his side of the story..."
              )}
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
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-2 max-w-[480px] justify-center">
            <button
              type="submit"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#add6ea] text-[#131c20] text-sm font-bold leading-normal tracking-[0.015em] grow disabled:opacity-60"
              disabled={loading}
              onClick={handleSubmit}
            >
              <span className="truncate">
                {loading ? t("loading") : t("submit")}
              </span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#293a42] text-white text-sm font-bold leading-normal tracking-[0.015em] grow disabled:opacity-60"
              disabled={loading}
            >
              <span className="truncate">{t("clear")}</span>
            </button>
          </div>
        </div>
        {loading || result ? (
          <ResultDisplay result={result} loading={loading} />
        ) : null}
        <div ref={resultRef} />
      </div>
    </MainLayout>
  );
};

export default App;
