"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Loader2, ExternalLink } from "lucide-react";

interface BibleVersePopoverProps {
  reference: string;
  children: React.ReactNode;
}

interface VerseData {
  reference: string;
  text: string;
  translation_name: string;
}

export function BibleVersePopover({
  reference,
  children,
}: BibleVersePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VerseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = async () => {
    if (data || loading) return;

    setLoading(true);
    setError(null);

    try {
      const encodedRef = encodeURIComponent(reference);
      const res = await fetch(
        `https://bible-api.com/${encodedRef}?translation=kjv`
      );
      if (!res.ok) throw new Error("Failed to fetch verse");

      const json = await res.json();

      console.log(json);
      setData({
        reference: json.reference,
        text: json.text,
        translation_name: json.translation_name,
      });
    } catch (err) {
      console.error(err);
      setError("Could not load verse text.");
    } finally {
      setLoading(false);
    }
  };

  const handlePopoverToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !data) {
      fetchVerse();
    }
  };

  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
    reference
  )}&version=KJV`;

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="cursor-help text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 underline-offset-2 transition-colors inline-block bg-transparent border-none p-0"
          onClick={(e) => {
            handlePopoverToggle();
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-80 bg-[#1a1a1a] border border-white/10 text-neutral-200 shadow-xl p-4 rounded-xl z-50 animate-in fade-in zoom-in-95 duration-200"
          sideOffset={5}
          onInteractOutside={() => {
            setIsOpen(false);
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-serif text-amber-500 text-lg font-medium leading-none">
                {reference}
              </h4>
              <a
                href={bibleGatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors"
                title="Open in Bible Gateway"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
              </div>
            ) : error ? (
              <p className="text-red-400 text-xs">{error}</p>
            ) : data ? (
              <>
                <p className="text-sm italic leading-relaxed text-neutral-300 font-serif">
                  "{data.text.trim()}"
                </p>
                <p className="text-[10px] uppercase tracking-widest text-neutral-600 text-right">
                  {data.translation_name}
                </p>
              </>
            ) : null}
            <Popover.Arrow className="fill-[#1a1a1a]" />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
