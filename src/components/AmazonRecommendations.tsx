import React from "react";
import { useTranslation } from "react-i18next";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";
import { getBookRecommendations } from "../data/books";

interface AmazonRecommendationsProps {
  selectedType: string;
}

const AmazonRecommendations: React.FC<AmazonRecommendationsProps> = ({
  selectedType,
}) => {
  const { t, i18n } = useTranslation();

  const TRACKING_ID = "whoisright-20";

  // Get book recommendations based on current language and debate type
  const bookRecommendations = getBookRecommendations(
    i18n.language,
    selectedType
  );

  return (
    <div className="bg-[#1a252f] py-8 px-4 rounded-xl mt-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-white text-2xl font-bold text-center mb-1">
          {t("recommendedBooks", "Recommended Books for Better Relationships")}
        </h3>
        <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          {t(
            "bookDescription",
            "These books can help you improve communication and resolve conflicts more effectively."
          )}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {bookRecommendations.map((book) => (
            <div
              key={book.id}
              className="bg-[#293a42] rounded-lg p-6 hover:bg-[#35505c] transition-colors"
            >
              <h4 className="text-white font-semibold text-lg mb-2">
                {book.title}
              </h4>
              <p className="text-gray-400 text-sm mb-3">by {book.author}</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {book.description}
              </p>
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#add6ea] text-[#131c20] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#8bc4d8] transition-colors inline-block"
                onClick={() => {
                  // Track Amazon book link click
                  logEvent(analytics, "amazon_book_clicked", {
                    book_title: book.title,
                    book_author: book.author,
                    book_category: book.category,
                    book_asin: book.asin,
                    debate_type: selectedType,
                    language: i18n.language,
                  });
                }}
              >
                {t("viewOnAmazon", "Find on Amazon")}
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">
            {t(
              "affiliateDisclosure",
              "As an Amazon Associate, we earn from qualifying purchases."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazonRecommendations;
