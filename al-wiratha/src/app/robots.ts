import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/calculator", "/auth/login", "/auth/register", "/privacy", "/terms"],
      disallow: ["/api/", "/dashboard", "/estates", "/profile", "/analytics", "/inheritance-calculator"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
