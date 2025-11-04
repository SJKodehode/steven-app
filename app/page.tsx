"use client";

import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { isDate } from "util/types";

type Target = {
  key: string;
  label: string;
  buildUrl: (q: string) => string;
  defaultOn?: boolean;
};

const dateToday = () => {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};
const dateTwoMonths = () => {
  const d = new Date();
  const month = (d.getMonth() + 3).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};


const TARGETS: Target[] = [
  { key: "google", label: "Google", buildUrl: q => `https://www.google.com/search?q=${q}`, defaultOn: true },
  { key: "gnews", label: "Google News", buildUrl: q => `https://news.google.com/search?q=${q}`, defaultOn: true },
  { key: "linkedin", label: "LinkedIn (People)", buildUrl: q => `https://www.linkedin.com/search/results/all/?keywords=${q}&origin=GLOBAL_SEARCH_HEADER&sid=noz`, defaultOn: true },
  { key: "lovdata", label: "Lovdata", buildUrl: q => `https://lovdata.no/pro/#result&id=${Math.floor(Math.random()*4000)}&q=${q}`, defaultOn: true },
  { key: "proff", label: "Proff.no (firma)", buildUrl: q => `https://www.proff.no/bransjes%C3%B8k?q=${q}`, defaultOn: true },
  { key: "Når går rettssaken", label: "Domsstol.no", buildUrl: q => `https://www.domstol.no/no/nar-gar-rettssaken/?fraDato=${dateToday()}&tilDato=${dateTwoMonths()}&domstolid=&sortTerm=rettsmoete&sortAscending=true&pageSize=1000&query=${q}&page=1`, defaultOn: true },
];

export default function App() {
  const [name, setName] = React.useState("");
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(TARGETS.map(t => [t.key, !!t.defaultOn]))
  );

  const q = encodeURIComponent(name.trim());
  const items = TARGETS.map(t => ({
    ...t,
    url: q ? t.buildUrl(q) : "",
    on: enabled[t.key],
  }));

  const openAll = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    for (const it of items) {
      if (it.on) window.open(it.buildUrl(encodeURIComponent(trimmed)), "_blank", "noopener");
    }
  };

  const toggle = (key: string) =>
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: "auto", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch", minHeight: "90vh" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Stevens search engine
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Type a name and open curated searches in new tabs. Assumes you’re signed in to each service.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="Name"
            placeholder={`e.g. Ola Nordmann`}
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
            inputProps={{ "aria-label": "Search name" }}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Button
              variant="contained"
              onClick={openAll}
              disabled={!name.trim() || !items.some(i => i.on)}
            >
              Open selected
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEnabled(Object.fromEntries(TARGETS.map(t => [t.key, true])))}
              disabled={Object.values(enabled).every(Boolean)}
            >
              Select all
            </Button>
            <Button
              variant="text"
              onClick={() => setEnabled(Object.fromEntries(TARGETS.map(t => [t.key, false])))}
              disabled={Object.values(enabled).every(v => !v)}
            >
              Clear
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {TARGETS.map(t => (
            <FormControlLabel
              key={t.key}
              control={
                <Checkbox
                  checked={!!enabled[t.key]}
                  onChange={() => toggle(t.key)}
                />
              }
              label={t.label}
            />
          ))}
        </Stack>
      </Paper>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Direct links
        {name.trim() ? (
          <Chip
            label={`for “${name.trim()}”`}
            size="small"
            sx={{ ml: 1 }}
          />
        ) : null}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {items.map(it => (
            <Link
              key={it.key}
              href={it.url || undefined}
              target="_blank"
              rel="noopener"
              underline="none"
              sx={{
                px: 1.25,
                py: 0.75,
                borderRadius: 1,
                border: "1px solid",
                borderColor: it.on ? "divider" : "transparent",
                bgcolor: it.on ? "background.paper" : "action.hover",
                pointerEvents: it.url ? "auto" : "none",
                color: it.url ? "primary.main" : "text.disabled",
                mr: 1,
                mb: 1,
              }}
            >
              {it.label}
            </Link>
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Note: browsers may block multiple pop-ups; if “Open selected” is limited, click links individually.
        </Typography>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <FuzzyMatcher />
    </Box>
    
  );
}

function FuzzyMatcher() {
  const [firmsRaw, setFirmsRaw] = React.useState<string>("");
  const [casesRaw, setCasesRaw] = React.useState<string>("");
  const [threshold, setThreshold] = React.useState<number>(0.82);
  const [onlyOsloTingrett, setOnlyOsloTingrett] = React.useState<boolean>(true);
  const [strictLastName, setStrictLastName] = React.useState<boolean>(true);
  const [keywordsRaw, setKeywordsRaw] = React.useState<string>("");
  const [ff, setFf] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    import("fast-fuzzy").then(mod => {
      if (mounted) setFf(mod);
    }).catch(() => {
      if (mounted) setFf(null);
    });
    return () => { mounted = false; };
  }, []);

  const parseJson = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const clean = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9æøå\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const stripCompanySuffix = (s: string) =>
    s
      .replace(/\b(advokatfirma(et)?)\b/gi, " ")
      .replace(/\b(as|asa|da|ans|ks|se)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const tokenize = (s: string) =>
    clean(stripCompanySuffix(s))
      .split(" ")
      .filter(Boolean);

  const reprForObject = (o: any): string => {
    if (!o || typeof o !== "object") return String(o ?? "");
    // Prefer common keys if present
    const preferred = [
      "navn",
      "name",
      "firma",
      "company",
      "title",
      "case",
      "party",
      "parties",
      "description",
      "court",
      "domstol",
      "sakenGjelder",
      "AdvokaterLang",
      "ParterLang",
      "saksnummer",
    ];
    for (const k of preferred) {
      if (typeof (o as any)[k] === "string") return (o as any)[k] as string;
      if (Array.isArray((o as any)[k])) {
        const arr = (o as any)[k].filter((x: any) => typeof x === "string");
        if (arr.length) return arr.join(" ");
      }
    }
    // Fallback: join all string values at top-level
    const strings = Object.values(o).filter(v => typeof v === "string") as string[];
    if (strings.length) return strings.join(" ");
    return JSON.stringify(o);
  };

  const extractStrings = (data: any, kind?: "firms" | "cases"): string[] => {
    if (!data) return [];
    if (typeof data === "string") return [data];
    if (Array.isArray(data)) {
      const out: string[] = [];
      for (const item of data) {
        if (typeof item === "string") out.push(item);
        else if (item && typeof item === "object") {
          if (kind === "firms" && typeof (item as any).navn === "string") out.push((item as any).navn);
          else if (kind === "cases") {
            const fields: string[] = [];
            const pushIf = (v: any) => { if (typeof v === "string" && v.trim()) fields.push(v); };
            pushIf((item as any).domstol);
            pushIf((item as any).sakenGjelder);
            pushIf((item as any).AdvokaterLang);
            pushIf((item as any).ParterLang);
            pushIf((item as any).parter);
            if (Array.isArray((item as any).bistandsadvokater)) {
              const arr = ((item as any).bistandsadvokater as any[]).filter(x => typeof x === "string");
              if (arr.length) fields.push(arr.join(" - "));
            }
            pushIf((item as any).saksnummer);
            if (!fields.length) out.push(reprForObject(item)); else out.push(fields.join(" "));
          } else out.push(reprForObject(item));
        }
      }
      return out;
    }
    if (typeof data === "object") {
      // Handle wrapper objects with a hits array (e.g., { hits: [...] })
      if (kind === "cases" && Array.isArray((data as any).hits)) {
        return extractStrings((data as any).hits, kind);
      }
      if (kind === "firms" && typeof (data as any).navn === "string") return [(data as any).navn];
      if (kind === "cases") {
        const fields: string[] = [];
        const pushIf = (v: any) => { if (typeof v === "string" && v.trim()) fields.push(v); };
        pushIf((data as any).domstol);
        pushIf((data as any).sakenGjelder);
        pushIf((data as any).AdvokaterLang);
        pushIf((data as any).ParterLang);
        pushIf((data as any).parter);
        if (Array.isArray((data as any).bistandsadvokater)) {
          const arr = ((data as any).bistandsadvokater as any[]).filter(x => typeof x === "string");
          if (arr.length) fields.push(arr.join(" - "));
        }
        pushIf((data as any).saksnummer);
        if (fields.length) return [fields.join(" ")];
      }
      return [reprForObject(data)];
    }
    return [];
  };

  type CaseRecord = { text: string; domstol?: string; lastNames: Set<string> };

  const extractLastNames = (s: string): string[] => {
    if (!s) return [];
    // Split multiple people: prioritize spaced hyphens, commas, semicolons, and newlines
    const parts = s.split(/\s+-\s+|[,;\n]+/).map(p => p.trim()).filter(Boolean);
    const out: string[] = [];
    for (const p of parts) {
      const words = p.split(/\s+/).filter(Boolean);
      if (!words.length) continue;
      // Handle "Last, First" pattern
      if (p.includes(",")) {
        const firstPart = p.split(",")[0]?.trim();
        if (firstPart) out.push(clean(firstPart));
        continue;
      }
      const last = words[words.length - 1];
      out.push(clean(last));
    }
    return Array.from(new Set(out.filter(Boolean)));
  };

  const extractCaseRecords = (data: any): CaseRecord[] => {
    // Normalize to an array of items if possible
    const items = Array.isArray(data)
      ? data
      : (data && typeof data === "object" && Array.isArray((data as any).hits) ? (data as any).hits : null);

    const makeTextFromItem = (item: any): string => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const fields: string[] = [];
        const pushIf = (v: any) => { if (typeof v === "string" && v.trim()) fields.push(v); };
        pushIf((item as any).domstol);
        pushIf((item as any).sakenGjelder);
        pushIf((item as any).AdvokaterLang);
        pushIf((item as any).ParterLang);
        pushIf((item as any).parter);
        if (Array.isArray((item as any).bistandsadvokater)) {
          const arr = ((item as any).bistandsadvokater as any[]).filter(x => typeof x === "string");
          if (arr.length) fields.push(arr.join(" - "));
        }
        pushIf((item as any).saksnummer);
        return fields.length ? fields.join(" ") : reprForObject(item);
      }
      return String(item ?? "");
    };

    const makeLastNames = (item: any): Set<string> => {
      const fromArrays = Array.isArray((item as any)?.bistandsadvokater)
        ? (item as any).bistandsadvokater.flatMap((s: any) => extractLastNames(String(s || "")))
        : [];
      const all = [
        ...extractLastNames(String((item as any)?.AdvokaterLang || "")),
        ...extractLastNames(String((item as any)?.ParterLang || "")),
        ...extractLastNames(String((item as any)?.parter || "")),
        ...extractLastNames(String((item as any)?.RettensFormann || "")),
        ...fromArrays,
      ].filter(Boolean);
      return new Set<string>(all);
    };

    if (items) {
      return items.map((item: any) => ({
        text: makeTextFromItem(item),
        domstol: typeof item === "object" ? (item as any).domstol : undefined,
        lastNames: makeLastNames(item),
      }));
    }

    // Fallback to string extraction if not an array structure
    const baseStrings = extractStrings(data, "cases");
    return baseStrings.map(t => ({ text: t, lastNames: new Set() }));
  };

  const score = (a: string, b: string) => {
    const ac = clean(stripCompanySuffix(a));
    const bc = clean(stripCompanySuffix(b));
    if (!ac || !bc) return 0;
    if (ac === bc) return 1;
    if (ac.length >= 5 && (bc.includes(ac) || ac.includes(bc))) return 0.98;
    const at = new Set(tokenize(a));
    const bt = new Set(tokenize(b));
    if (!at.size || !bt.size) return 0;
    let inter = 0;
    for (const t of at) if (bt.has(t)) inter++;
    const union = at.size + bt.size - inter;
    const jaccard = union ? inter / union : 0;
    // Weight towards overlap and partial containment when tokens are imbalanced
    const coverage = inter / Math.min(at.size, bt.size);
    return Math.max(jaccard, coverage * 0.85);
  };

  const firms = React.useMemo(() => extractStrings(parseJson(firmsRaw), "firms"), [firmsRaw]);
  const casesDataAll = React.useMemo(() => extractCaseRecords(parseJson(casesRaw)), [casesRaw]);
  const casesData = React.useMemo(() => {
    if (!onlyOsloTingrett) return casesDataAll;
    return casesDataAll.filter(cr => /oslo\s+tingrett/i.test(cr.domstol || cr.text));
  }, [casesDataAll, onlyOsloTingrett]);
  const casesStrings = React.useMemo(() => casesData.map(c => c.text), [casesData]);

  const ffSearcher = React.useMemo(() => {
    if (!ff || !casesStrings.length) return null;
    try {
      if ((ff as any).Searcher) {
        return new (ff as any).Searcher(casesStrings, { keySelector: (s: string) => s, ignoreCase: true, returnMatchData: true });
      }
      return null;
    } catch {
      return null;
    }
  }, [ff, casesStrings]);

  const scorerName = React.useMemo(() => (ffSearcher ? "fast-fuzzy" : "basic"), [ffSearcher]);

  const keywords = React.useMemo(() => {
    const parts = keywordsRaw
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    // Use cleaned tokens for matching, keep original list for highlighting
    return parts.map(p => ({ raw: p, norm: clean(p) })).filter(k => k.norm.length >= 2);
  }, [keywordsRaw]);

  const keywordMatches = React.useMemo(() => {
    if (!keywords.length || !casesData.length) return [] as CaseRecord[];
    return casesData.filter(cr => {
      const crNorm = clean(cr.text);
      return keywords.some(k => crNorm.includes(k.norm));
    });
  }, [keywords, casesData]);

  const matches = React.useMemo(() => {
    if (!firms.length || !casesData.length) return [] as { firm: string; hits: { text: string; score: number }[] }[];
    const out: { firm: string; hits: { text: string; score: number }[] }[] = [];
    for (const f of firms) {
      let hits: { text: string; score: number }[] = [];
      if (strictLastName) {
        const firmTokens = new Set(tokenize(f));
        const matched = casesData.filter(cr => {
          for (const ln of cr.lastNames) {
            if (firmTokens.has(ln)) return true;
          }
          return false;
        });
        hits = matched.map(m => ({ text: m.text, score: 1 }));
      } else {
        if (ffSearcher && typeof (ffSearcher as any).search === "function") {
          try {
            const res = (ffSearcher as any).search(f, { threshold });
            if (Array.isArray(res) && res.length && typeof res[0] === "object" && "item" in res[0]) {
              hits = (res as any[])
                .map((r: any) => ({ text: String(r.item), score: typeof r.score === "number" ? r.score : 0 }))
                .filter(x => x.score >= threshold)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            } else if (Array.isArray(res)) {
              hits = (res as any[])
                .map((text: any) => ({ text: String(text), score: score(f, String(text)) }))
                .filter(x => x.score >= threshold)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            }
          } catch {
            // ignore; will fallback
          }
        }
        if (!hits.length) {
          hits = casesStrings
            .map(c => ({ text: c, score: score(f, c) }))
            .filter(x => x.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        }
      }
      out.push({ firm: f, hits });
    }
    return out.filter(m => m.hits.length > 0);
  }, [firms, casesData, casesStrings, threshold, ffSearcher, strictLastName]);

  const onPickFile = async (file: File, which: "firms" | "cases") => {
    const text = await file.text();
    if (which === "firms") setFirmsRaw(text);
    else setCasesRaw(text);
  };

  const renderHighlight = (text: string, firm: string) => {
    const tokens = tokenize(firm).filter(t => t.length >= 3);
    if (!tokens.length) return text;
    const pattern = new RegExp(`(${tokens.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(pattern);
    return (
      <>
        {parts.map((part, i) =>
          tokens.some(t => t.toLowerCase() === part.toLowerCase()) ? (
            <mark key={i}>{part}</mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  const escapeRe = (s: string) => s.replace(/[\-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const renderHighlightKeywords = (text: string) => {
    const toks = keywords.map(k => k.raw).filter(t => t.length >= 2);
    if (!toks.length) return text;
    const pattern = new RegExp(`(${toks.map(t => escapeRe(t)).join("|")})`, "gi");
    const parts = text.split(pattern);
    return (
      <>
        {parts.map((part, i) =>
          toks.some(t => t.toLowerCase() === part.toLowerCase()) ? (
            <mark key={i}>{part}</mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        JSON Matcher (firms vs. cases)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload two JSON files. One should list law firms; the other should list cases (strings or objects). We’ll fuzzy-match and highlight likely connections.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" component="label">
          Upload firms.json
          <input
            type="file"
            hidden
            accept="application/json,.json"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f, "firms");
              e.currentTarget.value = "";
            }}
          />
        </Button>
        <Button variant="outlined" component="label">
          Upload cases.json
          <input
            type="file"
            hidden
            accept="application/json,.json"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f, "cases");
              e.currentTarget.value = "";
            }}
          />
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", mb: 2 }}>
        <TextField
          label="Keywords (comma or newline separated)"
          placeholder="e.g. erstatning, samvær, heleri"
          value={keywordsRaw}
          onChange={e => setKeywordsRaw(e.target.value)}
          fullWidth
        />
        <Chip label={`${keywords.length} keywords`} variant="outlined" />
        <Chip label={`${keywordMatches.length} cases match keywords`} variant="outlined" />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", mb: 2 }}>
        <TextField
          label="Threshold"
          type="number"
          inputProps={{ step: 0.01, min: 0.5, max: 0.99 }}
          value={threshold}
          onChange={e => setThreshold(Math.min(0.99, Math.max(0.5, Number(e.target.value))))}
          sx={{ width: 140 }}
          disabled={strictLastName}
        />
        <FormControlLabel
          control={<Checkbox checked={onlyOsloTingrett} onChange={e => setOnlyOsloTingrett(e.target.checked)} />}
          label="Only cases mentioning ‘Oslo tingrett’"
        />
        <FormControlLabel
          control={<Checkbox checked={strictLastName} onChange={e => setStrictLastName(e.target.checked)} />}
          label="Strict last-name match"
        />
        <Chip label={`${firms.length} firms`} variant="outlined" />
        <Chip label={`${casesStrings.length} cases`} variant="outlined" />
        <Chip label={`Scorer: ${scorerName}${strictLastName ? " (overridden)" : ""}`} variant="outlined" />
      </Stack>

      {!firms.length || !casesStrings.length ? (
        <Typography variant="body2" color="text.secondary">
          Waiting for files… Provide both to see matches.
        </Typography>
      ) : matches.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No matches above threshold.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {matches.map(m => (
            <Box key={m.firm} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                {m.firm}
              </Typography>
              <Stack spacing={1}>
                {m.hits.map((h, i) => (
                  <Box key={i} sx={{ bgcolor: "action.hover", p: 1, borderRadius: 1 }}>
                    <Typography variant="body2">
                      {renderHighlight(h.text, m.firm)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      score: {h.score.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
      {keywords.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Keyword Matches
          </Typography>
          {keywordMatches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No cases contain the given keywords.</Typography>
          ) : (
            <Stack spacing={1}>
              {keywordMatches.slice(0, 100).map((cr, idx) => (
                <Box key={idx} sx={{ bgcolor: "action.hover", p: 1, borderRadius: 1 }}>
                  <Typography variant="body2">{renderHighlightKeywords(cr.text)}</Typography>
                  {cr.domstol ? (
                    <Typography variant="caption" color="text.secondary">{cr.domstol}</Typography>
                  ) : null}
                </Box>
              ))}
              {keywordMatches.length > 100 && (
                <Typography variant="caption" color="text.secondary">Showing first 100 of {keywordMatches.length} matches…</Typography>
              )}
            </Stack>
          )}
        </Paper>
      )}
    </Paper>
  );
}
