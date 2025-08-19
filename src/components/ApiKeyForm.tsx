"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProviderKey = "openai" | "gemini" | "deepseek" | "zai";

type ProviderMeta = {
  label: string;
  placeholder: string;
  infoUrl: string;
};

const PROVIDERS: Record<ProviderKey, ProviderMeta> = {
  openai: {
    label: "OpenAI",
    placeholder: "sk-...",
    infoUrl: "https://platform.openai.com/api-keys",
  },
  gemini: {
    label: "Gemini",
    placeholder: "AIza...",
    infoUrl: "https://aistudio.google.com/app/apikey",
  },
  deepseek: {
    label: "DeepSeek",
    placeholder: "sk-...",
    infoUrl: "https://platform.deepseek.com/api-keys",
  },
  zai: {
    label: "GLM (ZhipuAI)",
    placeholder: "YOUR_ZAI_KEY",
    infoUrl: "https://open.bigmodel.cn/usercenter/apikeys",
  },
};

function isLikelyValid(key: string) {
  return key.trim().length > 15;
}

export default function ApiKeyForm() {
  const [keys, setKeys] = useState<Record<ProviderKey, string>>({
    openai: "",
    gemini: "",
    deepseek: "",
    zai: "",
  });
  const [saved, setSaved] = useState<Record<ProviderKey, boolean>>({
    openai: false,
    gemini: false,
    deepseek: false,
    zai: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("multi-ai-keys");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<ProviderKey, string>>;
        setKeys((k) => ({ ...k, ...parsed }));
        const s: Record<ProviderKey, boolean> = { openai: false, gemini: false, deepseek: false, zai: false };
        (Object.keys(parsed) as ProviderKey[]).forEach((p) => {
          s[p] = isLikelyValid(parsed[p] ?? "");
        });
        setSaved(s);
      }
    } catch { }
  }, []);

  const canContinue = useMemo(() => Object.values(saved).some(Boolean), [saved]);

  function saveKeys() {
    const filtered: Partial<Record<ProviderKey, string>> = {};
    (Object.keys(PROVIDERS) as ProviderKey[]).forEach((k) => {
      if (isLikelyValid(keys[k])) filtered[k] = keys[k].trim();
    });
    localStorage.setItem("multi-ai-keys", JSON.stringify(filtered));
    const s: Record<ProviderKey, boolean> = { openai: false, gemini: false, deepseek: false, zai: false };
    (Object.keys(filtered) as ProviderKey[]).forEach((p) => (s[p] = true));
    setSaved(s);
  }

  return (
    <div className="grid gap-4">
      {(Object.keys(PROVIDERS) as ProviderKey[]).map((provider) => {
        const meta = PROVIDERS[provider];
        return (
          <Card key={provider} className="card">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{meta.label}</span>
                <span className="text-xs opacity-70">{saved[provider] ? "Saved" : "Not saved"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-3">
                <Input
                  value={keys[provider]}
                  onChange={(e) => setKeys((k) => ({ ...k, [provider]: e.target.value }))}
                  placeholder={meta.placeholder}
                />
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs">How to get API key</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 text-sm">
                        <p>
                          1. Visit <a className="text-blue-600 hover:underline" href={meta.infoUrl} target="_blank" rel="noreferrer">provider console</a>
                        </p>
                        <p>2. Create a new secret key</p>
                        <p>3. Copy and paste the key here</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="mt-2 flex flex-wrap gap-3">
        <Button onClick={saveKeys}>Save</Button>
        <Button asChild disabled={!canContinue} variant={canContinue ? "default" : "secondary"}>
          <Link aria-disabled={!canContinue} href={canContinue ? "/chat" : "#"}>Continue</Link>
        </Button>
      </div>
    </div>
  );
}


