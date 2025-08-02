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

type Props = {
  result: string | null;
  loading?: boolean;
};

// Function to parse and structure the AI response
const parseResult = (result: string) => {
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

  // Extract sections using HTML strong tags (converted from markdown)
  const htmlSectionPattern =
    /<strong>(.*?)<\/strong>:\s*([^<]+?)(?=<strong>|$)/g;
  const sections: Array<{ title: string; content: string }> = [];
  let match;

  while ((match = htmlSectionPattern.exec(cleanedResult)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim(),
    });
  }
  // If we found structured sections, render them
  if (sections.length > 0) {
    const structuredSections: JSX.Element[] = [];

    sections.forEach((section, index) => {
      const { title, content } = section;

      switch (title.toLowerCase()) {
        case "situation":
          structuredSections.push(
            <Section key={`situation-${index}`}>
              <SectionTitle>Situation:</SectionTitle>
              <SituationText>{content}</SituationText>
            </Section>
          );
          break;
        case "friend 1":
        case "friend a":
          structuredSections.push(
            <Section key={`friend1-${index}`}>
              <SectionTitle>Friend 1:</SectionTitle>
              <FriendView>
                <FriendLabel>Friend 1's View:</FriendLabel>
                {content}
              </FriendView>
            </Section>
          );
          break;
        case "friend 2":
        case "friend b":
          structuredSections.push(
            <Section key={`friend2-${index}`}>
              <SectionTitle>Friend 2:</SectionTitle>
              <FriendView>
                <FriendLabel>Friend 2's View:</FriendLabel>
                {content}
              </FriendView>
            </Section>
          );
          break;
        case "the verdict":
        case "verdict":
          structuredSections.push(
            <Section key={`verdict-${index}`}>
              <VerdictSection>
                <VerdictTitle>The Verdict:</VerdictTitle>
                {content}
              </VerdictSection>
            </Section>
          );
          break;
        default:
          // For any other sections, create a generic section
          structuredSections.push(
            <Section key={`${title}-${index}`}>
              <SectionTitle>{title}:</SectionTitle>
              <div>{content}</div>
            </Section>
          );
      }
    });

    return structuredSections;
  }

  // If no structured sections found, try to parse the text manually
  // Look for common patterns in the response
  const lines = cleanedResult.split("\n").filter((line) => line.trim());
  const manualSections: JSX.Element[] = [];

  let currentSection = "";
  let currentContent = "";

  for (const line of lines) {
    // Check if this line looks like a section header (HTML tags after conversion)
    if (
      line.includes("<strong>") &&
      line.includes("</strong>") &&
      line.includes(":")
    ) {
      // Save previous section if exists
      if (currentSection && currentContent) {
        manualSections.push(
          createSection(currentSection, currentContent.trim())
        );
      }

      // Extract new section from HTML tags
      const sectionMatch = line.match(/<strong>(.*?)<\/strong>:\s*(.*)/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim();
        currentContent = sectionMatch[2].trim();
      }
    } else {
      // Add to current content
      if (currentContent) {
        currentContent += " " + line.trim();
      } else {
        currentContent = line.trim();
      }
    }
  }

  // Add the last section
  if (currentSection && currentContent) {
    manualSections.push(createSection(currentSection, currentContent.trim()));
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

// Helper function to create sections
const createSection = (title: string, content: string): JSX.Element => {
  switch (title.toLowerCase()) {
    case "situation":
      return (
        <Section key="situation">
          <SectionTitle>Situation:</SectionTitle>
          <SituationText>{content}</SituationText>
        </Section>
      );
    case "friend 1":
    case "friend a":
      return (
        <Section key="friend1">
          <SectionTitle>Friend 1:</SectionTitle>
          <FriendView>
            <FriendLabel>Friend 1's View:</FriendLabel>
            {content}
          </FriendView>
        </Section>
      );
    case "friend 2":
    case "friend b":
      return (
        <Section key="friend2">
          <SectionTitle>Friend 2:</SectionTitle>
          <FriendView>
            <FriendLabel>Friend 2's View:</FriendLabel>
            {content}
          </FriendView>
        </Section>
      );
    case "the verdict":
    case "verdict":
      return (
        <Section key="verdict">
          <VerdictSection>
            <VerdictTitle>The Verdict:</VerdictTitle>
            {content}
          </VerdictSection>
        </Section>
      );
    default:
      return (
        <Section key={title}>
          <SectionTitle>{title}:</SectionTitle>
          <div>{content}</div>
        </Section>
      );
  }
};

const ResultDisplay: React.FC<Props> = ({ result, loading }) => {
  const { t } = useTranslation();

  if (loading) return <Loading>{t("loading")}</Loading>;
  if (!result) return <ResultBox>{t("resultPlaceholder")}</ResultBox>;

  return <ResultBox>{parseResult(result)}</ResultBox>;
};

export default ResultDisplay;
