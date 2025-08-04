import React from "react";
import styled from "styled-components";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
}

const StyledImage = styled.img<{ $width?: number; $height?: number }>`
  width: ${(props) => (props.$width ? `${props.$width}px` : "auto")};
  height: ${(props) => (props.$height ? `${props.$height}px` : "auto")};
  object-fit: contain;
  transition: opacity 0.3s ease;

  &.loading {
    opacity: 0;
  }

  &.loaded {
    opacity: 1;
  }
`;

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <StyledImage
      src={src}
      alt={alt}
      $width={width}
      $height={height}
      className={`${className || ""} ${isLoaded ? "loaded" : "loading"}`}
      loading={loading}
      onLoad={handleLoad}
    />
  );
};

export default OptimizedImage;
