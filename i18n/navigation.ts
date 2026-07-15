import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** locale prefix 를 자동 처리하는 내비게이션 유틸.
 *  내부 링크·스위처는 next/link 대신 여기서 import 한다. */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
