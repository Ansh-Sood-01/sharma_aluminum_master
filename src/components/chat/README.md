# Customer care

`CustomerCareWidget.tsx` contains the multilingual chat interface. `/api/chat` applies best-effort rate limiting, uses an optional OpenAI-compatible API when configured, falls back to a deterministic FAQ response, and stores conversation/message rows in Supabase when the server-only key is configured. When an answer needs a person, the widget opens a callback enquiry form; that request is stored with the regular enquiry and callback records.
