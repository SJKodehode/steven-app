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
    </Box>
    
  );
}
