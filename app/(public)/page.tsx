import fs from "fs";
import path from "path";

export default function LandingPage() {
  const filePath = path.join(process.cwd(), "public", "landing.html");
  const htmlContent = fs.readFileSync(filePath, "utf8");

  // Extract content inside body tag
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: bodyContent }}
    />
  );
}
