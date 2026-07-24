import fs from "fs";
import path from "path";

export default function LandingPage() {
  const filePath = path.join(process.cwd(), "public", "landing.html");
  const htmlContent = fs.readFileSync(filePath, "utf8");

  // Extract all <style> tags AND <body> content so no CSS rules are stripped
  const styles = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : htmlContent;

  const fullRenderHtml = styles.join("\n") + "\n" + body.replace(/\r\n/g, "\n");

  return (
    <div
      suppressHydrationWarning={true}
      dangerouslySetInnerHTML={{ __html: fullRenderHtml }}
    />
  );
}
