import React, { JSX, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import gsap from "gsap";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";

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
  position: relative;
`;

const Watermark = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(26, 54, 93, 0.4);
  pointer-events: none;
  display: none; /* Hidden by default */
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &.visible-in-capture {
    display: block;
  }
`;

// Wave loading component with Tailwind CSS
const WaveLoading: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="mt-8 text-lg text-gray-500">
      <div className="flex items-center justify-center">
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="inline-block animate-wave"
            style={{
              animationDelay: `${index * 0.2}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
};

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

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const BuyMeCoffeeLink = styled.a`
  background-color: #ffdd00;
  color: #000000;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  text-decoration: none;

  &:hover {
    background-color: #e5c700;
    transform: translateY(-1px);
  }
`;

const ShareButton = styled.button`
  background-color: #3182ce;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    background-color: #2c5282;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

type Props = {
  result: string | null;
  loading?: boolean;
  loadingMessage?: string;
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
      const content = cleanedResult.substring(contentStart, contentEnd).trim();

      sections.push(createSection(currentHeader.title, content));
    }

    return sections;
  }

  // Fallback: return as plain text with line breaks
  const fallbackContent = DOMPurify.sanitize(
    cleanedResult.replace(/\n/g, "<br/>")
  );
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: fallbackContent,
      }}
    />
  );
};

const ResultDisplay: React.FC<Props> = ({
  result,
  loading,
  loadingMessage,
}) => {
  const { t } = useTranslation();
  const boxRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!boxRef.current) return;

    try {
      setSharing(true);

      const options: any = {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc", // Ensure solid background to prevent black bars
        width: 600, // Force standard width to prevent narrow/tall images on mobile
        windowWidth: 600,
        onclone: (clonedDoc: Document) => {
          // Make watermark visible
          const watermark = clonedDoc.querySelector(".watermark");
          if (watermark) {
            (watermark as HTMLElement).style.display = "block";
          }

          // Clean up the box styles for capture
          const clonedBox = clonedDoc.querySelector(
            ".result-box"
          ) as HTMLElement;
          if (clonedBox) {
            clonedBox.style.margin = "0";
            clonedBox.style.boxShadow = "none";
            clonedBox.style.transform = "none";
            // Ensure box fills the fixed width canvas
            clonedBox.style.width = "100%";
            clonedBox.style.maxWidth = "100%";
            clonedBox.style.borderRadius = "0";
          }

          // Hide the footer/share button in the clone explicitly
          const footer = clonedDoc.querySelector("[data-html2canvas-ignore]");
          if (footer) {
            (footer as HTMLElement).style.display = "none";
          }
        },
      };

      const canvas = await html2canvas(boxRef.current, options);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to generate image");
        }

        const file = new File([blob], "who-is-right-result.png", {
          type: "image/png",
        });

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Who is Right?",
              text: "Check out this verdict from Who is Right!",
              files: [file],
            });
          } catch (error) {
            // Share cancelled or failed, fallback to download
            if ((error as any).name !== "AbortError") {
              console.error("Error sharing:", error);
            }
          }
        } else {
          // Fallback for desktop/unsupported browsers
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "who-is-right-result.png";
          link.click();
        }
      }, "image/png");
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setSharing(false);
    }
  };

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
            <SituationText
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </Section>
        );
      case "the verdict":
      case "verdict":
      case "o veredicto":
      case "el veredicto":
        return (
          <Section key="verdict" className="section verdict">
            <SectionTitle>{t("theVerdict")}:</SectionTitle>
            <VerdictSection
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </Section>
        );
      default:
        return (
          <Section key={title} className="section default">
            <SectionTitle>{t(title)}:</SectionTitle>
            <DefaultSection
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </Section>
        );
      }
  };

  if (loading) return <WaveLoading text={loadingMessage || t("loading")} />;
  if (!result) return <ResultBox>{t("resultPlaceholder")}</ResultBox>;

  return (
    <ResultBox ref={boxRef} className="result-box">
      <Watermark className="watermark">whoisright.app</Watermark>
      {parseResult(result, createSection)}
      <Footer data-html2canvas-ignore="true">
        <ShareButton onClick={handleShare} disabled={sharing}>
          {sharing ? (
            <span>{t("generating")}</span>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              {t("shareResult")}
            </>
          )}
        </ShareButton>
        <BuyMeCoffeeLink
          href="https://buymeacoffee.com/dekonunessh"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          Buy me a coffee
        </BuyMeCoffeeLink>
      </Footer>
    </ResultBox>
  );
};

export default ResultDisplay;
