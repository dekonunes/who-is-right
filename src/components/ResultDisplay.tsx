import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const ResultBox = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f0f4fa;
  color: #222;
  font-size: 1.15rem;
  min-height: 48px;
  text-align: center;
`;

const Loading = styled.div`
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #888;
`;

type Props = {
  result: string | null;
  loading?: boolean;
};

const ResultDisplay: React.FC<Props> = ({ result, loading }) => {
  const { t } = useTranslation();
  if (loading) return <Loading>{t("loading")}</Loading>;
  if (!result) return <ResultBox>{t("resultPlaceholder")}</ResultBox>;
  return <ResultBox>{result}</ResultBox>;
};

export default ResultDisplay;
