# SOGN SAFE VESSEL

Captain Communication System — INN524 classroom prototype.

This app is the vessel-side conversational bridge. The captain speaks or types. The Vessel Agent interprets. The captain confirms. Deterministic software sends a structured event to the SOGN SAFE Platform. The Vessel App does not alert civilians and does not control the ship.

## Run locally

Install dependencies, then start the Vessel Agent server and the Expo app:

```bash
npm install
npm run server
npm start
```

For web verification:

```bash
npm run web
```

The existing classroom Platform / simulator should be running on port 4000 (`../app` → `npm start`). Confirmed emergencies are sent to `POST /api/vessel/events` and activate the Fjordvik scenario used by the Platform and Civilian App.

## Environment

Copy `.env.example` to `.env` for the **server only**. The OpenRouter key never goes into the Expo app.

The Vessel Agent uses the [OpenRouter Agent SDK](https://openrouter.ai/docs/agent-sdk/overview) (`@openrouter/agent`) and walks this free-model list:

- Chat: `minimax/minimax-m3:free` → `thinkingmachines/inkling:free` → `openrouter/free`
- TTS: `deepgram/flux-tts:free` → `fish-audio/s2.1-pro-free:free`

If every free model fails, deterministic phrase matching still runs the classroom emergency/recovery demo.

## Critical demo line

Captain: “We have lost maneuverability.”

Vessel Agent asks for confirmation. Captain presses **REPORT EMERGENCY**. Platform receives `VESSEL_EMERGENCY_TRIGGERED`.
