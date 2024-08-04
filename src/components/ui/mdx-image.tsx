import NextImage from "next/image";
import { cn } from "@/lib/utils";

type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

const Image: React.FC<ImageProps> = ({ src, alt, className, ...props }) => {
  if (!src) return null;

  const isExternal = src.startsWith("http") || src.startsWith("https");

  if (isExternal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("rounded-md border border-border", className)}
        {...props}
      />
    );
  }
  const [imageSrc, dimensions] = src.split("#");
  let width: number = DEFAULT_WIDTH;
  let height: number = DEFAULT_HEIGHT;

  if (dimensions) {
    const params = new URLSearchParams(dimensions);
    const parsedWidth = parseInt(params.get("width") || "", 10);
    const parsedHeight = parseInt(params.get("height") || "", 10);

    width = !isNaN(parsedWidth) ? parsedWidth : DEFAULT_WIDTH;
    height = !isNaN(parsedHeight) ? parsedHeight : DEFAULT_HEIGHT;
  }

  return (
    <NextImage
      src={imageSrc || src}
      alt={alt || ""}
      width={width}
      height={height}
      className={cn("rounded-md border border-border", className)}
      {...(props as Omit<ImageProps, "width" | "height" | "src" | "alt">)}
    />
  );
};

export default Image;
