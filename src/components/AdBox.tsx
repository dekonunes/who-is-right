import React, { useEffect, useRef } from "react";

interface AdBoxProps {
  adSlot: string;
  adFormat?: "auto" | "fluid";
  className?: string;
}

const AdBox: React.FC<AdBoxProps> = ({
  adSlot,
  adFormat = "auto",
  className = "",
}) => {
  const adRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Load AdSense ad when component mounts
    if (adRef.current && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.error("Error loading AdSense ad:", error);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef as any}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1577201166601141"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBox;
