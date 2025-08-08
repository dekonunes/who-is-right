import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const ResultBox = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #1a202c;
  font-size: 1.1rem;
  min-height: 48px;
  text-align: left;
  line-height: 1.7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
`;

const Loading = styled.div`
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #888;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SituationText = styled.div`
  background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
  padding: 1.25rem;
  border-radius: 12px;
  border-left: 5px solid #3182ce;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(49, 130, 206, 0.1);
`;

const FriendView = styled.div`
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 5px solid #38a169;
  box-shadow: 0 2px 4px rgba(56, 161, 105, 0.1);
`;

const FriendLabel = styled.strong`
  color: #2d3748;
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const VerdictSection = styled.div`
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  padding: 1.25rem;
  border-radius: 12px;
  border-left: 5px solid #e53e3e;
  margin-top: 1.5rem;
  box-shadow: 0 2px 4px rgba(229, 62, 62, 0.1);
`;

const VerdictTitle = styled.h4`
  font-weight: 700;
  color: #c53030;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DefaultSection = styled.div`
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  padding: 1.25rem;
  border-radius: 12px;
  border-left: 5px solid #718096;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(113, 128, 150, 0.1);
`;

type Props = {
  result: string | null;
  loading?: boolean;
};

// Function to parse and structure the AI response
const parseResult = (
  result: string,
  createSection: (title: string, content: string) => JSX.Element
) => {
  // Remove markdown code blocks if present
  let cleanedResult = result;

  // Remove ```html ... ``` blocks
  cleanedResult = cleanedResult.replace(/```html\s*([\s\S]*?)\s*```/g, "$1");

  // Remove ``` ... ``` blocks (generic code blocks)
  cleanedResult = cleanedResult.replace(/```\s*([\s\S]*?)\s*```/g, "$1");

  // Convert markdown ** to HTML <strong> tags
  cleanedResult = cleanedResult.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Remove any leading/trailing whitespace
  cleanedResult = cleanedResult.trim();

  // If no structured sections found, try to parse the text manually
  // Look for common patterns in the response
  // Split by <strong> tags since there are no \n characters
  const sections = cleanedResult
    .split(/<strong>/)
    .filter((section) => section.trim());
  const manualSections: JSX.Element[] = [];

  for (const section of sections) {
    // Each section should start with the title and content
    const sectionMatch = section.match(/(.*?):<\/strong>\s*(.*)/);
    if (sectionMatch) {
      const title = sectionMatch[1]?.trim();
      const content = sectionMatch[2]?.trim();
      manualSections.push(createSection(title, content));
    }
  }

  // If we found manual sections, return them
  if (manualSections.length > 0) {
    return manualSections;
  }

  // Fallback: return as plain text with line breaks
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: cleanedResult.replace(/\n/g, "<br/>"),
      }}
    />
  );
};

const ResultDisplay: React.FC<Props> = ({ result, loading }) => {
  const { t } = useTranslation();

  // Helper function to create sections
  const createSection = (title: string, content: string): JSX.Element => {
    switch (title.toLowerCase()) {
      case "situation":
      case "situação":
        return (
          <Section key="situation">
            <SectionTitle>{t("situation")}:</SectionTitle>
            <SituationText>{content}</SituationText>
          </Section>
        );
      case "the verdict":
      case "verdict":
      case "o veredicto":
      case "el veredicto":
        return (
          <Section key="verdict">
            <SectionTitle>{t("theVerdict")}:</SectionTitle>
            <VerdictSection>{content}</VerdictSection>
          </Section>
        );
      default:
        return (
          <Section key={title}>
            <SectionTitle>{t(title)}:</SectionTitle>
            <DefaultSection>{content}</DefaultSection>
          </Section>
        );
    }
  };

  if (loading) return <Loading>{t("loading")}</Loading>;
  if (!result) return <ResultBox>{t("resultPlaceholder")}</ResultBox>;

  return <ResultBox>{parseResult(result, createSection)}</ResultBox>;
};

export default ResultDisplay;
