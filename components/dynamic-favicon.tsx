"use client";

import { useEffect } from "react";

export default function DynamicFavicon({ logoUrl }: { logoUrl?: string }) {
  useEffect(() => {
    if (logoUrl) {
      // Find or create favicon link
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = logoUrl;

      // Also update apple-touch-icon
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = logoUrl;
      }
    }
  }, [logoUrl]);

  return null;
}
