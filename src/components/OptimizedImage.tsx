import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

const StyledImage = styled.img<{ $width?: number; $height?: number }>`
  width: ${(props) => (props.$width ? `${props.$width}px` : "auto")};
  height: ${(props) => (props.$height ? `${props.$height}px` : "auto")};
  object-fit: contain;
  transition: opacity 0.3s ease;
  will-change: opacity;

  &.loading {
    opacity: 0;
  }

  &.loaded {
    opacity: 1;
  }

  &.error {
    opacity: 0.5;
    filter: grayscale(100%);
  }
`;

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  priority = false,
  sizes,
  quality = 85,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate optimized src with WebP support and quality
  const optimizedSrc = useMemo(() => {
    if (src.includes("data:") || src.includes("http")) {
      return src;
    }

    // For local assets, ensure we're using WebP when available
    if (src.endsWith(".png") || src.endsWith(".jpg") || src.endsWith(".jpeg")) {
      const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, ".webp");
      return webpSrc;
    }

    return src;
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  // Generate srcSet for responsive images if width is provided
  const srcSet = useMemo(() => {
    if (!width || src.includes("data:") || src.includes("http")) {
      return undefined;
    }

    const baseSrc = optimizedSrc.replace(/\.(webp|png|jpg|jpeg)$/i, "");
    const extension =
      optimizedSrc.match(/\.(webp|png|jpg|jpeg)$/i)?.[0] || ".webp";

    return [
      `${baseSrc}${extension} 1x`,
      `${baseSrc}@2x${extension} 2x`,
      `${baseSrc}@3x${extension} 3x`,
    ].join(", ");
  }, [optimizedSrc, width]);

  return (
    <StyledImage
      src={optimizedSrc}
      srcSet={srcSet}
      alt={alt}
      $width={width}
      $height={height}
      className={`${className || ""} ${isLoaded ? "loaded" : "loading"} ${
        hasError ? "error" : ""
      }`}
      loading={priority ? "eager" : loading}
      decoding="async"
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        contentVisibility: loading === "lazy" ? "auto" : "visible",
        containIntrinsicSize:
          width && height ? `${width}px ${height}px` : undefined,
      }}
    />
  );
};

export default OptimizedImage;
