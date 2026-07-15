import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // api·_next·_vercel, 그리고 확장자 있는 정적/메타 파일(icon.png,
  // opengraph-image, sitemap.xml, robots.txt, octopus*.png, ads.txt 등)은 제외.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
