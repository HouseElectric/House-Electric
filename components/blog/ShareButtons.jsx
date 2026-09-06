"use client";

import { useState } from "react";
import { LinkedInIcon, LinkIcon, WhatsAppIcon, XIcon } from "../icons";

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);

  const links = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  const btnBase =
    "grid h-10 w-10 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="mr-1 text-[12px] font-extrabold uppercase tracking-wider text-body/80">Share</span>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:border-transparent hover:bg-[#25D366] hover:text-white`}
        title="Share on WhatsApp"
      >
        <WhatsAppIcon className="h-5 w-5" />
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} border-[#0A66C2]/30 bg-[#0A66C2]/10 text-[#0A66C2] hover:border-transparent hover:bg-[#0A66C2] hover:text-white`}
        title="Share on LinkedIn"
      >
        <LinkedInIcon className="h-5 w-5" />
      </a>
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} border-ink/20 bg-ink/5 text-ink hover:border-transparent hover:bg-ink hover:text-white`}
        title="Share on X (Twitter)"
      >
        <XIcon className="h-5 w-5" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={`${btnBase} border-yellow/40 bg-yellow/15 text-yellow-dark hover:border-transparent hover:bg-yellow-dark hover:text-white`}
        title="Copy link"
      >
        <LinkIcon className="h-5 w-5" />
      </button>
      {copied && <span className="text-[12.5px] font-semibold text-emerald-600">Link copied!</span>}
    </div>
  );
}
