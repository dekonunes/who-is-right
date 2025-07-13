import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Label = styled.label`
  color: #000;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
`;

const TextArea = styled.textarea<{ error?: boolean }>`
  width: 100%;
  min-height: 48px;
  font-size: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.error ? "#e74c3c" : "#ccc")};
  margin-bottom: 0.5rem;
  resize: vertical;
`;

const Count = styled.div<{ error?: boolean }>`
  font-size: 0.95rem;
  color: ${(props) => (props.error ? "#e74c3c" : "#888")};
  text-align: right;
  margin-bottom: 1rem;
`;

const ErrorMsg = styled.div`
  color: #e74c3c;
  font-size: 0.98rem;
  margin-bottom: 0.5rem;
`;

type Props = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  error?: string;
};

const AnswerInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  maxLength,
  error,
}) => {
  const { t } = useTranslation();
  const overLimit = value.length > maxLength;
  return (
    <div>
      <Label>{t(label)}</Label>
      <TextArea
        placeholder={t("answerPlaceholder", { label: t(label) })}
        value={value}
        onChange={onChange}
        maxLength={maxLength + 20}
        error={!!error || overLimit}
      />
      <Count error={overLimit}>
        {t("charCount", { count: value.length, max: maxLength })}
      </Count>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  );
};

export default AnswerInput;
