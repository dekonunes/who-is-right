import React, { JSX, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import gsap from "gsap";
import DOMPurify from "dompurify";

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

  // Find all section headers (pattern: <strong>Title:</strong>)
  // This regex specifically looks for headers ending with ':'
  const headerRegex = /<strong>([^<]+?):<\/strong>/g;
  const headers: Array<{ title: string; index: number; endIndex: number }> = [];
  let regexMatch;

  // Use a while loop to find all header matches
  while ((regexMatch = headerRegex.exec(cleanedResult)) !== null) {
    headers.push({
      title: regexMatch[1].trim(),
      index: regexMatch.index,
      endIndex: regexMatch.index + regexMatch[0].length,
    });
  }

  // If we found headers, extract content between them
  if (headers.length > 0) {
    const sections: JSX.Element[] = [];

    for (let i = 0; i < headers.length; i++) {
      const currentHeader = headers[i];
      const nextHeader = headers[i + 1];

      // Extract content from end of current header to start of next header (or end of string)
      const contentStart = currentHeader.endIndex;
      const contentEnd = nextHeader ? nextHeader.index : cleanedResult.length;
      const content = cleanedResult
        .substring(contentStart, contentEnd)
        .trim();

      sections.push(createSection(currentHeader.title, content));
    }

    return sections;
  }

  // Fallback: return as plain text with line breaks
  const fallbackContent = DOMPurify.sanitize(cleanedResult.replace(/\n/g, "<br/>"));
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: fallbackContent,
      }}
    />
  );
};

const ResultDisplay: React.FC<Props> = ({ result, loading }) => {
  const { t } = useTranslation();
  const boxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!boxRef.current || !result) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".result-box", { opacity: 0, y: 8, duration: 0.25 })
        .from(
          ".section.situation",
          { opacity: 0, x: -12, duration: 0.25 },
          "-=0.05"
        )
        .from(
          ".section.default",
          { opacity: 0, y: 10, duration: 0.2, stagger: 0.06 },
          "-=0.05"
        )
        .from(".section.verdict", { scale: 0.96, opacity: 0, duration: 0.22 });
    }, boxRef);
    return () => ctx.revert();
  }, [result]);

  // Helper function to create sections
  const createSection = (title: string, content: string): JSX.Element => {
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(content);

    switch (title.toLowerCase()) {
      case "situation":
      case "situação":
        return (
          <Section key="situation" className="section situation">
            <SectionTitle>{t("situation")}:</SectionTitle>
            <SituationText dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </Section>
        );
      case "the verdict":
      case "verdict":
      case "o veredicto":
      case "el veredicto":
        return (
          <Section key="verdict" className="section verdict">
            <SectionTitle>{t("theVerdict")}:</SectionTitle>
            <VerdictSection dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </Section>
        );
      default:
        return (
          <Section key={title} className="section default">
            <SectionTitle>{t(title)}:</SectionTitle>
            <DefaultSection dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </Section>
        );
    }
  };

  if (loading) return <Loading>{t("loading")}</Loading>;
  if (!result) return <ResultBox>{t("resultPlaceholder")}</ResultBox>;

  return (
    <ResultBox ref={boxRef} className="result-box">
      {parseResult(result, createSection)}
    </ResultBox>
  );
};

export default ResultDisplay;
