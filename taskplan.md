taskplan.md — SOGN SAFE Vessel App
# SOGN SAFE VESSEL
## Captain Communication System

Status:
INN524 classroom prototype

Target:
iPhone first

Technology:
Expo
React Native
TypeScript
Expo Router

Voice:

Primary STT:
Apple Speech / SFSpeechRecognizer

Optional STT fallback:
Whisper through backend

Agent brain:
MiniMax M3 :free through OpenRouter

TTS:
Apple AVSpeechSynthesizer
or an Expo abstraction that uses the native Apple speech synthesizer.

Platform:
SOGN SAFE Platform API

Mode:
TRAINING / FICTIONAL PROTOTYPE

---

# PRODUCT PURPOSE

SOGN SAFE Vessel is a conversational bridge communication prototype.

The captain should not need to navigate complicated emergency forms.

Instead:

1. Captain speaks or types.
2. Vessel Agent understands the situation.
3. Vessel Agent extracts structured vessel information.
4. Vessel Agent asks questions if critical information is ambiguous.
5. Vessel Agent shows the captain what it understood.
6. Captain explicitly confirms.
7. Deterministic software sends the event to the SOGN SAFE Platform.
8. Platform becomes the source of truth.
9. Platform agents react.
10. Platform determines civilian communication.
11. Civilian App receives the emergency alert.

IMPORTANT:

The Vessel Agent does NOT directly alert civilians.

The Vessel Agent does NOT directly control the ship.

The Vessel App does NOT connect to:

- propulsion
- engine controls
- rudder
- thrusters
- autopilot
- navigation-control machinery

This is a communication and status-reporting prototype only.

---

# CRITICAL DEMONSTRATION FLOW

The following must genuinely work:

Captain:

"We have lost maneuverability."

↓

Apple Speech converts voice to text.

↓

Vessel Agent interprets:

MANEUVERABILITY_LOST

↓

Vessel Agent asks:

"I understood that maneuverability has been lost.
Report this emergency to SOGN SAFE?"

↓

Captain presses:

REPORT EMERGENCY

↓

Vessel App sends:

VESSEL_EMERGENCY_TRIGGERED

↓

SOGN SAFE Platform receives event.

↓

Platform changes incident state to ACTIVE.

↓

Maritime Agent appears active.

↓

Coordinator Agent appears active.

↓

Platform alert pipeline triggers.

↓

Civilian iPhone receives SOGN SAFE emergency notification.

This flow has priority over all other Vessel App functionality.

---

# IMPLEMENTATION RULES

`taskplan.md` is the implementation source of truth.

Use:

- [ ] incomplete
- [x] implemented AND verified

Rules:

1. Read repository instructions before implementation.
2. Read `mainidea.md`.
3. Read complete existing `taskplan.md`.
4. Inspect the current Civilian App and Platform contracts.
5. Reuse shared event types whenever possible.
6. Do not duplicate existing platform logic inside Vessel App.
7. Complete phases sequentially.
8. After every task:
   - implement
   - verify
   - update taskplan
9. Mark `[x]` only after successful verification.
10. If blocked:

`BLOCKED: <exact reason + next required action>`

11. Do not put OpenRouter API keys inside the mobile application.
12. Do not let LLM availability determine whether a confirmed emergency reaches the Platform.
13. Critical event transmission must be deterministic.
14. Optimize for classroom reliability instead of production complexity.

---

# VESSEL PHASE V0 — Inspect Existing Ecosystem

Before writing Vessel App code:

- [ ] Read repository instructions.
- [ ] Read `mainidea.md`.
- [ ] Read complete `taskplan.md`.
- [ ] Inspect Civilian App.
- [ ] Inspect Platform implementation.
- [ ] Inspect shared domain types.
- [ ] Inspect event contracts.
- [ ] Inspect Platform API.
- [ ] Inspect authentication/device-registration approach.
- [ ] Inspect realtime implementation.
- [ ] Inspect OpenRouter backend.
- [ ] Inspect current Apple Speech implementation if already created.
- [ ] Inspect current Apple TTS implementation if already created.
- [ ] Record findings in `taskplan.md`.

## Acceptance criteria

Vessel App architecture is designed around the current project instead of duplicating existing infrastructure.

---

# VESSEL PHASE V1 — Freeze Prototype Scope

Classify features:

## LEVEL A — REAL

Must actually work:

- captain text input
- captain voice input
- STT
- Vessel Agent interpretation
- confirmation
- structured event creation
- Vessel App → Platform communication
- Platform acknowledgement
- emergency event
- vessel status update
- recovery event
- connection state

## LEVEL B — SIMULATED / INTERACTIVE

May be scenario driven:

- vessel speed
- heading
- GPS trajectory
- system telemetry
- propulsion indicators
- bridge subsystem status
- simulated weather
- destination
- maritime warnings

## LEVEL C — VISUAL ONLY

Do not implement deeply:

- AIS integration
- radar
- ECDIS
- engine interfaces
- real distress communications
- maritime authority integrations
- autopilot
- propulsion control

Tasks:

- [ ] Record Level A features.
- [ ] Record Level B features.
- [ ] Record Level C features.
- [ ] Add explicit non-goals.
- [ ] Confirm TRAINING MODE.

## Acceptance criteria

No developer wastes time building real vessel-control infrastructure.

---

# VESSEL PHASE V2 — Create Vessel App Project

Create:

`apps/vessel-mobile`

or preserve existing repository layout if a different structure is already established.

Tasks:

- [ ] Create Expo app.
- [ ] Enable TypeScript strict mode where compatible.
- [ ] Configure Expo Router.
- [ ] Configure environment variables.
- [ ] Add lint.
- [ ] Add type-check command.
- [ ] Add development build configuration.
- [ ] Add iOS bundle identifier.
- [ ] Add placeholder splash.
- [ ] Add temporary app icon.
- [ ] Verify app launches.

## Acceptance criteria

Vessel App runs independently on iOS simulator/development device.

---

# VESSEL PHASE V3 — Add Vessel Brand Assets

Use the new:

SOGN SAFE VESSEL

Captain Communication System

identity.

Brand characteristics:

- graphite
- metallic silver
- dark navy/black
- restrained maritime visual language
- no civilian green-shield branding
- no Platform coordination-node logo
- no purple
- no neon
- no generic AI appearance

Tasks:

- [ ] Add Vessel logo asset.
- [ ] Add app icon.
- [ ] Add symbol-only version.
- [ ] Add dark-background version.
- [ ] Add light-background version where required.
- [ ] Add splash-screen composition.
- [ ] Verify icon at small size.

## Acceptance criteria

Vessel App is clearly a different SOGN SAFE product while remaining part of the same ecosystem.

---

# VESSEL PHASE V4 — Vessel Design System

Define:

Graphite:
primary shell

Silver:
brand

Deep maritime blue:
neutral operational information

Green:
normal / connected

Amber:
warning

Red:
emergency only

Warm white:
content surfaces

Tasks:

- [ ] Define colors.
- [ ] Define typography.
- [ ] Define spacing.
- [ ] Define touch-target sizes.
- [ ] Define cards.
- [ ] Define status indicators.
- [ ] Define buttons.
- [ ] Define microphone states.
- [ ] Define emergency confirmation appearance.
- [ ] Define connection indicator.
- [ ] Add design tokens.

## Acceptance criteria

All screens use one consistent Vessel visual system.

---

# VESSEL PHASE V5 — Define Vessel Data Model

Create shared or application types.

Example:

```ts
interface VesselContext {
  vesselId: string;
  vesselName: string;
  vesselType: string;

  position?: {
    latitude: number;
    longitude: number;
  };

  speedKnots?: number;
  headingDegrees?: number;

  maneuverabilityStatus: VesselManeuverabilityStatus;
  propulsionStatus: VesselPropulsionStatus;

  platformConnection: ConnectionStatus;
  activeIncidentId?: string;

  trainingMode: boolean;
  updatedAt: string;
}

Possible maneuverability statuses:

NORMAL
REDUCED
LOST
RECOVERING
RESTORED
UNKNOWN

Possible propulsion statuses:

NORMAL
DEGRADED
FAILED
RECOVERING
RESTORED
UNKNOWN

Tasks:

 Define VesselContext.
 Define maneuverability enum.
 Define propulsion enum.
 Define connection state.
 Define incident reference.
 Define captain identity placeholder.
 Reuse shared platform types where possible.
Acceptance criteria

Vessel App and Platform represent vessel state identically.

VESSEL PHASE V6 — Define Vessel Events

Critical shared events:

VESSEL_CONNECTED

VESSEL_DISCONNECTED

VESSEL_STATUS_UPDATED

VESSEL_POSITION_UPDATED

VESSEL_WARNING_REPORTED

VESSEL_EMERGENCY_TRIGGERED

VESSEL_EMERGENCY_CONFIRMED

VESSEL_RECOVERY_REPORTED

VESSEL_MANEUVERABILITY_RESTORED

VESSEL_MESSAGE_SENT

VESSEL_MESSAGE_RECEIVED

Base event:

interface VesselEvent<T> {
  id: string;
  type: VesselEventType;
  vesselId: string;
  incidentId?: string;
  timestamp: string;
  source: "VESSEL_APP";
  payload: T;
}

Tasks:

 Define Vessel event types.
 Export through shared package.
 Add runtime validation.
 Add event test fixtures.
 Add unit tests.
Acceptance criteria

Platform can validate every event received from Vessel App.

VESSEL PHASE V7 — Create Demo Vessel

Create preconfigured vessel:

Name:
MS Fjord Star

Type:
Passenger vessel

Scenario:
FJORDVIK_VESSEL_01

Status:
NORMAL

Training mode:
TRUE

Demo telemetry:

Position:
near Fjordvik harbor

Speed:
8.4 kn

Heading:
127°

Maneuverability:
NORMAL

Tasks:

 Add demo vessel config.
 Add fictional position.
 Add fictional speed.
 Add fictional heading.
 Add platform endpoint.
 Add training mode.
 Add reset values.
Acceptance criteria

Vessel App launches in a predictable classroom-ready initial state.

VESSEL PHASE V8 — Build Main Captain Screen

Target screen:

SOGN SAFE VESSEL                TRAINING

MS FJORD STAR

              ● NORMAL

       Vessel connected
       Platform connected ✓


              🎙

          TALK TO SOGN

     Tell me what is happening.


Position           Shared ✓
Platform           Connected ✓
Last update        14:40:21

Tasks:

 Build header.
 Add Vessel logo.
 Add TRAINING MODE.
 Add vessel name.
 Add main state indicator.
 Add platform connection state.
 Add microphone button.
 Add text input option.
 Add position status.
 Add last-update timestamp.
 Add subtle telemetry display.
Acceptance criteria

Captain understands the entire app without opening another screen.

VESSEL PHASE V9 — Captain Text Conversation

Before voice:

make typed conversation functional.

Flow:

Captain types
       ↓
Vessel Agent
       ↓
Agent response
       ↓
Conversation displayed

Tasks:

 Create conversation state.
 Create captain messages.
 Create agent messages.
 Create text input.
 Add send.
 Add typing/loading state.
 Add retry.
 Add conversation scroll behavior.
Acceptance criteria

Captain can interact with Vessel Agent without microphone.

VESSEL PHASE V10 — Define Vessel Agent

The Vessel Agent has exactly five primary responsibilities:

LISTEN

UNDERSTAND

CLARIFY

CONFIRM

REPORT

It is not:

an autopilot
a navigation controller
an engine controller
a maritime authority
an emergency dispatcher

Tasks:

 Define Vessel Agent identity.
 Define permissions.
 Define prohibited actions.
 Define context input.
 Define supported event outputs.
 Define clarification behavior.
 Define confirmation behavior.
 Document safety boundary.
Acceptance criteria

Agent authority is explicit and limited.

VESSEL PHASE V11 — Vessel Agent Context

Every agent request receives:

VESSEL CONTEXT

Vessel:
MS Fjord Star

Position:
60.x / 7.x

Speed:
8.4 kn

Heading:
127°

Maneuverability:
NORMAL

Propulsion:
NORMAL

Platform:
CONNECTED

Active incident:
NONE

Training mode:
TRUE

Tasks:

 Build context generator.
 Pull vessel state.
 Pull connection state.
 Pull active incident.
 Include latest confirmed captain reports.
 Include training mode.
 Test context generator.
Acceptance criteria

Captain does not need to repeatedly state information the app already knows.

VESSEL PHASE V12 — Structured Vessel Agent Output

Never rely only on prose.

Preferred output:

{
  "message": "I understood that maneuverability has been lost.",
  "intent": "VESSEL_EMERGENCY",
  "confidence": 0.96,
  "proposedEvent": {
    "type": "VESSEL_EMERGENCY_TRIGGERED",
    "incidentType": "MANEUVERABILITY_LOST"
  },
  "requiresConfirmation": true
}

Possible intents:

GENERAL_MESSAGE
STATUS_UPDATE
MANEUVERABILITY_REDUCED
MANEUVERABILITY_LOST
PROPULSION_FAILURE
RECOVERY
MANEUVERABILITY_RESTORED
EMERGENCY
UNKNOWN

Tasks:

 Define response schema.
 Validate response server-side.
 Reject unknown event types.
 Reject arbitrary actions.
 Map supported events.
 Add tests.
Acceptance criteria

LLM cannot invent executable Platform operations.

VESSEL PHASE V13 — MiniMax Agent Backend

Use:

MiniMax M3 :free

through OpenRouter.

IMPORTANT:

OpenRouter API key lives server-side only.

Tasks:

 Add Vessel Agent endpoint.
 Create /api/agents/vessel.
 Add OpenRouter client.
 Configure model through environment variable.
 Send VesselContext.
 Send captain message.
 Request structured response.
 Validate response.
 Add timeout.
 Add error handling.
 Add free-model capacity fallback.
Acceptance criteria

Captain text can be interpreted without exposing API credentials.

VESSEL PHASE V14 — Deterministic Agent Fallback

Very important for classroom demo.

If MiniMax fails:

phrases like:

"We lost maneuverability."

"We cannot steer."

"We have lost steering."

"Ship is not responding."

"We have full control again."

should still work using deterministic prototype intent matching.

Tasks:

 Add emergency phrase matcher.
 Add recovery phrase matcher.
 Add unknown-intent fallback.
 Add explicit FALLBACK indicator for development.
 Test with OpenRouter disabled.
Acceptance criteria

Classroom demonstration works even when MiniMax is unavailable.

VESSEL PHASE V15 — Ambiguity Clarification

Example:

Captain:

"We have engine problems."

Do NOT immediately trigger emergency.

Agent:

"Are you still able to maneuver the vessel?"

Captain:

"No."

Then:

"I understand that maneuverability has been lost."

Tasks:

 Detect ambiguous statements.
 Generate one short clarification.
 Store pending interpretation.
 Process captain answer.
 Convert clarification into structured intent.
 Avoid long interrogation chains.
Acceptance criteria

Critical reports are not guessed from ambiguous captain language.

VESSEL PHASE V16 — Emergency Confirmation Screen

Before transmission show:

⚠ POSSIBLE EMERGENCY

I understood:

MANEUVERABILITY
LOST

Position
Shared

Speed
8.4 kn

Heading
127°

Report this emergency
to SOGN SAFE Platform?

[ REPORT EMERGENCY ]

[ CANCEL ]

Tasks:

 Create confirmation screen/modal.
 Display interpreted event.
 Display relevant context.
 Add REPORT EMERGENCY.
 Add CANCEL.
 Prevent double submission.
 Add tactile confirmation feedback where appropriate.
Acceptance criteria

No emergency event leaves Vessel App without captain confirmation.

VESSEL PHASE V17 — Platform Connection Service

Create Vessel Platform client.

Required methods:

connect()

getStatus()

sendEvent(event)

sendEmergency(event)

sendStatusUpdate(event)

getIncident()

disconnect()

Tasks:

 Create API client.
 Configure Platform base URL.
 Add request timeout.
 Add retry logic.
 Add connection state.
 Add reconnect.
 Prevent duplicate emergency submission.
 Add request IDs.
Acceptance criteria

Vessel App can reliably communicate with Platform prototype.

VESSEL PHASE V18 — REAL EMERGENCY DEMO EVENT

THIS IS LEVEL A.

After captain confirmation:

create:

{
  "type": "VESSEL_EMERGENCY_TRIGGERED",
  "vesselId": "MS_FJORD_STAR",
  "incidentType": "MANEUVERABILITY_LOST",
  "reportedBy": "CAPTAIN",
  "trainingMode": true
}

Tasks:

 Construct event.
 Validate locally.
 Submit to Platform.
 Receive Platform acknowledgement.
 Store event ID.
 Update Vessel App state.
 Prevent duplicate trigger.
 Add event log.
Acceptance criteria

Platform receives a valid vessel emergency from real Vessel App.

VESSEL PHASE V19 — Emergency Reported Screen

After successful acknowledgement:

🚨 EMERGENCY REPORTED

14:41:03

SOGN SAFE Platform received:

✓ Maneuverability lost
✓ Vessel position
✓ Vessel identity
✓ Current heading
✓ Current speed

Platform coordination activated.

[ CONTINUE TALKING ]

Do not claim civilian alert was delivered until Platform actually reports that state.

Tasks:

 Build confirmation state.
 Display Platform acknowledgement.
 Display event ID if useful in developer mode.
 Display incident ID.
 Add Continue Talking.
 Show latest Platform status.
Acceptance criteria

Captain clearly knows Platform received the report.

VESSEL PHASE V20 — Platform Realtime Updates

Vessel App should receive limited relevant Platform status.

Examples:

INCIDENT ACTIVE

PLATFORM COORDINATION ACTIVE

PUBLIC WARNING ISSUED

INCIDENT STABILIZING

INCIDENT RESOLVED

Tasks:

 Subscribe to incident state.
 Subscribe to relevant acknowledgements.
 Update Vessel App.
 Handle reconnect.
 Prevent duplicate events.
Acceptance criteria

Vessel App reflects Platform state without manual refresh.

VESSEL PHASE V21 — Apple Speech Permission

Voice is primary interaction.

Tasks:

 Add microphone permission description.
 Add Speech Recognition permission.
 Add friendly pre-permission explanation.
 Handle accepted.
 Handle denied.
 Handle restricted.
 Preserve text conversation when denied.
Acceptance criteria

Voice permission failure never prevents typed communication.

VESSEL PHASE V22 — Apple Speech STT

Create abstraction:

interface SpeechToTextProvider {
  start(): Promise<void>;
  stop(): Promise<SpeechResult>;
  cancel(): Promise<void>;
}

Primary:

Apple Speech / SFSpeechRecognizer.

Tasks:

 Implement Apple Speech provider.
 Start recognition.
 Receive partial transcript.
 Receive final transcript.
 Handle cancellation.
 Handle failure.
 Test bridge/noisy environment.
 Test physical iPhone.
 Test English.
 Test Norwegian if required.
Acceptance criteria

Captain speech reliably becomes visible text.

VESSEL PHASE V23 — Listening UX

States:

IDLE

LISTENING

TRANSCRIBING

UNDERSTANDING

CONFIRMATION REQUIRED

REPORTING

REPORTED

ERROR

Tasks:

 Add microphone animation.
 Add LISTENING label.
 Display partial transcript.
 Display final transcript.
 Add cancel control.
 Add haptics.
 Avoid distracting animation.
Acceptance criteria

Captain always knows whether the app is listening.

VESSEL PHASE V24 — Voice → Agent Pipeline

Implement:

Microphone
   ↓
Apple Speech
   ↓
Transcript
   ↓
Vessel Agent
   ↓
Structured interpretation
   ↓
Confirmation

Tasks:

 Connect STT result to conversation.
 Send final transcript only.
 Build VesselContext.
 Call Vessel Agent.
 Validate response.
 Render interpretation.
 Route to clarification or confirmation.
Acceptance criteria

Captain can initiate the emergency process entirely with voice.

VESSEL PHASE V25 — Apple TTS

Vessel Agent should speak short replies.

Examples:

"Are you still able to maneuver?"

"I understood that maneuverability has been lost."

Tasks:

 Create TTS service.
 Use Apple AVSpeechSynthesizer.
 Add English voice.
 Add Norwegian voice where appropriate.
 Keep messages short.
 Add STOP SPEAKING.
 Stop TTS when microphone starts.
Acceptance criteria

Agent can conduct a short spoken conversation with captain.

VESSEL PHASE V26 — Push-to-Talk Interaction

V1:

PUSH TO TALK

not always listening.

Flow:

Captain taps microphone

LISTENING

Captain speaks

Stop / silence

Agent understands

Agent replies

Tasks:

 Implement push-to-talk.
 Implement stop recording.
 Prevent simultaneous TTS + STT.
 Handle rapid repeat interactions.
 Handle interrupted TTS.
Acceptance criteria

Voice interaction feels fast and predictable.

VESSEL PHASE V27 — Recovery Conversation

Example:

Captain:

"The engines are responding again."

Agent:

"I understood that propulsion is recovering.
Send this update?"

Captain confirms.

Platform receives:

VESSEL_STATUS_UPDATED

Tasks:

 Detect recovery intent.
 Show interpretation.
 Require confirmation.
 Submit structured update.
 Update Vessel state.
 Update Platform.
 Add timeline event.
Acceptance criteria

Captain can update Platform through conversation after emergency.

VESSEL PHASE V28 — Maneuverability Restored

Captain:

"We have full maneuverability again."

Agent:

"I understood:
Maneuverability restored.

Send update?"

After confirmation:

VESSEL_MANEUVERABILITY_RESTORED

Tasks:

 Detect restored state.
 Require confirmation.
 Send event.
 Update local state.
 Update Platform state.
 Trigger Platform agent response.
Acceptance criteria

Vessel recovery can advance the demo toward resolution.

VESSEL PHASE V29 — Captain Message History

Show compact operational history:

14:40 Vessel connected

14:41 Captain:
"We have lost maneuverability."

14:41 Vessel Agent:
Emergency confirmed.

14:41 Platform:
Incident ACTIVE.

14:45 Platform:
Public warning issued.

Tasks:

 Build compact history.
 Distinguish captain/agent/platform.
 Add timestamps.
 Keep recent messages.
 Reset between training scenarios.
Acceptance criteria

Captain can quickly understand what has already been communicated.

VESSEL PHASE V30 — Connection Failure

If Platform disconnects:

show prominently:

⚠ PLATFORM CONNECTION LOST

Do not say an emergency was delivered unless acknowledged.

Tasks:

 Detect loss.
 Show connection warning.
 Store pending confirmed event.
 Retry safely.
 Avoid duplicate emergency reports.
 Allow conversation to continue.
 Restore connection state.
Acceptance criteria

The app never falsely claims Platform received an event.

VESSEL PHASE V31 — MiniMax Failure

If Vessel Agent fails:

display:

AGENT TEMPORARILY UNAVAILABLE

You can still report the training emergency manually.

[ REPORT MANEUVERABILITY LOST ]

[ TYPE MESSAGE ]

This backup should only exist in TRAINING MODE prototype.

Tasks:

 Detect agent failure.
 Add deterministic emergency fallback.
 Add text fallback.
 Keep Platform connection active.
 Test with OpenRouter disabled.
Acceptance criteria

OpenRouter outage cannot destroy classroom demonstration.

VESSEL PHASE V32 — Demo Emergency Backup

Add hidden Training Mode control:

DEMO CONTROLS

[ TRIGGER MANEUVERABILITY LOST ]

[ RESTORE MANEUVERABILITY ]

[ RESET VESSEL ]

Tasks:

 Add development/demo panel.
 Hide from normal main interaction.
 Clearly mark simulation.
 Reuse real event pipeline.
Acceptance criteria

Presenter can recover from speech/model issues quickly.

VESSEL PHASE V33 — Training Safety

Display:

TRAINING MODE

FICTIONAL VESSEL

NO REAL EMERGENCY SERVICES CONNECTED

where appropriate.

Tasks:

 Add Training Mode to home.
 Add to emergency confirmation.
 Add to reported screen.
 Add to demo controls.
 Add to transmitted prototype event.
Acceptance criteria

Prototype cannot reasonably be confused with real maritime emergency infrastructure.

VESSEL PHASE V34 — Accessibility
 Large microphone button.
 Large confirmation buttons.
 Strong contrast.
 VoiceOver labels.
 Dynamic Type.
 Do not rely on color alone.
 Text input always available.
 Agent speech optional.
 Reduced-motion compatibility.
Acceptance criteria

Captain can operate critical prototype functions without voice.

VESSEL PHASE V35 — Visual Polish

Main screen should remain extremely simple.

Priorities:

vessel state
Platform connection
TALK TO SOGN
conversation
emergency confirmation

Tasks:

 Remove unnecessary navigation.
 Remove decorative clutter.
 Optimize one-handed operation.
 Verify projector/demo readability.
 Keep critical status visible.
 Polish logo placement.
 Verify dark/light environment contrast.
Acceptance criteria

The UI looks like a purpose-built bridge communication product, not a generic chatbot.

VESSEL PHASE V36 — Platform Integration Test

Test:

Vessel App
    ↓
Vessel Agent
    ↓
Confirmation
    ↓
Platform API
    ↓
Incident ACTIVE

Tasks:

 Reset scenario.
 Connect Vessel App.
 Speak emergency.
 Verify STT.
 Verify agent interpretation.
 Confirm.
 Verify Platform receives event.
 Verify Platform incident turns ACTIVE.
 Verify agent activity begins.
Acceptance criteria

Vessel side of demo works without manual Platform intervention.

VESSEL PHASE V37 — Complete Three-System Test

THIS IS THE MAIN ACCEPTANCE TEST.

Hardware:

Device A:
Vessel App

Laptop:
SOGN SAFE Platform

Device B:
Civilian App

Run:

Captain:
"We've lost maneuverability."

↓

Vessel Agent:
"I understood maneuverability has been lost.
Report emergency?"

↓

Captain:
REPORT EMERGENCY

↓

Platform:
ACTIVE MARITIME INCIDENT

↓

Maritime Agent:
Activated

↓

Coordinator Agent:
Activated

↓

Platform:
PUBLIC_ALERT_ISSUED

↓

Civilian iPhone:
🚨 EMERGENCY ALERT

Tasks:

 Reset all systems.
 Verify Vessel connection.
 Verify Civilian connection.
 Trigger by captain voice.
 Verify Vessel Agent.
 Confirm emergency.
 Verify Platform.
 Verify Platform agents.
 Verify notification generation.
 Verify physical Civilian iPhone receives alert.
 Verify Civilian emergency screen.
 Record timestamps.
Acceptance criteria

One spoken captain report causes the full SOGN SAFE classroom scenario to begin.

VESSEL PHASE V38 — Recovery End-to-End Test

Run:

Captain:
"We have full maneuverability again."

↓

Vessel Agent:
"Send maneuverability restored update?"

↓

Captain confirms

↓

Platform:
VESSEL RECOVERING

↓

Maritime Agent:
Risk reduced

↓

Coordinator Agent:
Incident STABILIZING

Tasks:

 Test voice.
 Test interpretation.
 Confirm update.
 Verify Platform update.
 Verify agent reactions.
 Verify timeline.
Acceptance criteria

Vessel conversation can also drive incident recovery.

VESSEL PHASE V39 — Scenario Reset

After presentation:

reset Vessel App to:

NORMAL

Platform:
CONNECTED

Active incident:
NONE

Conversation:
EMPTY

Training mode:
TRUE

Tasks:

 Subscribe to DEMO_RESET.
 Reset Vessel state.
 Clear pending interpretation.
 Clear conversation.
 Stop STT.
 Stop TTS.
 Return home.
Acceptance criteria

Demo can be repeated without restarting the application.

VESSEL PHASE V40 — Physical Device QA

Test on real iPhone:

 app startup
 logo
 microphone permission
 Apple Speech
 Apple TTS
 text conversation
 MiniMax
 deterministic fallback
 Platform connection
 emergency confirmation
 event delivery
 reconnect
 recovery
 scenario reset

Test with:

 quiet room
 classroom noise
 slow Wi-Fi
 OpenRouter disabled
 Platform temporarily disconnected
Acceptance criteria

Vessel App behaves predictably under likely presentation conditions.

VESSEL PHASE V41 — TestFlight
 Configure production-like bundle ID.
 Configure permissions.
 Configure app icon.
 Configure splash.
 Build with EAS.
 Upload TestFlight build.
 Install on captain demo iPhone.
 Verify Platform URL configuration.
 Verify microphone.
 Verify STT.
 Verify TTS.
 Verify emergency event.
Acceptance criteria

Vessel App works from TestFlight without development tooling.

VESSEL PHASE V42 — Classroom Demo Script
Scene 1 — Normal

Captain device:

MS FJORD STAR

● NORMAL

Platform Connected ✓

TALK TO SOGN

Platform:

NO ACTIVE INCIDENT

Civilian:

SAFE
Scene 2 — Captain Reports Emergency

Captain presses microphone:

"We've lost maneuverability."

Scene 3 — Agent Interpretation

Vessel Agent:

⚠ POSSIBLE EMERGENCY

I understood:

MANEUVERABILITY LOST

Report to SOGN SAFE Platform?

Captain:

REPORT EMERGENCY

Scene 4 — Platform Response

Projector:

🚨 ACTIVE MARITIME INCIDENT

MS FJORD STAR
MANEUVERABILITY LOST

Maritime Agent activates.

Coordinator Agent activates.

Scene 5 — Civilian Alert

Civilian iPhone:

🚨 EMERGENCY ALERT

Possible vessel collision
near Fjordvik harbor.

GO TO SAFETY

I NEED HELP
Scene 6 — Continue Vessel Conversation

Captain:

"The engines are responding again."

Agent:

PROPULSION RECOVERING

Send update?

Captain confirms.

Scene 7 — Recovery

Captain:

"We have full maneuverability again."

Agent confirms.

Platform:

INCIDENT STABILIZING
Scene 8 — End

Coordinator ends fictional incident.

All systems return to training-ready state.

VESSEL PHASE V43 — Final Verification

Run:

 lint
 TypeScript
 unit tests
 event-schema tests
 Vessel Agent tests
 deterministic fallback tests
 iOS build
 physical device test
 Platform integration test
 full three-system test
 TestFlight smoke test
 reset test

Verify:

 captain can type
 captain can speak
 STT works
 agent understands emergency
 ambiguous reports are clarified
 captain confirmation is mandatory
 Vessel App cannot directly alert civilians
 Vessel App sends structured Platform event
 Platform receives event
 Platform triggers civilian alert
 MiniMax failure does not stop demo
 connection loss is represented truthfully
 recovery event works
 TRAINING MODE remains visible
 no real vessel system is controlled
DEFINITION OF DONE

SOGN SAFE Vessel is complete for the INN524 prototype when:

Captain can communicate primarily by voice.
Captain can always fall back to text.
Vessel Agent understands the Fjordvik maneuverability-loss scenario.
Vessel Agent asks for clarification when needed.
Vessel Agent converts conversation into structured events.
Captain must confirm critical events.
Vessel App sends confirmed events to SOGN SAFE Platform.
Platform acknowledges receipt.
Platform agents react.
Platform sends the civilian emergency signal.
Civilian App receives a real notification.
Captain can later report recovery conversationally.
Platform receives recovery state.
Whole scenario is resettable.
MiniMax is not required for critical event transmission.
No real vessel-control system is connected.
All surfaces clearly identify TRAINING MODE.
END-OF-SESSION REPORT

At the end of every Vessel App implementation session:

Completed phase
Completed tasks
Verification performed
Files changed
Physical-device tests
Platform integration status
Civilian integration status
Open blockers
Next unchecked task

### The most important architectural separation

Do **not** build this:

```text
Captain
   ↓
MiniMax
   ↓
MiniMax decides emergency
   ↓
MiniMax alerts civilians

Build this:

CAPTAIN
   ↓
Apple Speech
   ↓
VESSEL AGENT
   ↓
interprets
   ↓
CAPTAIN CONFIRMS
   ↓
STRUCTURED EVENT
   ↓
SOGN SAFE PLATFORM
   ↓
┌─────────────────────────────┐
│ Maritime Agent              │
│ Coordinator Agent           │
│ Routing Agent               │
│ Civilian Agent              │
└─────────────────────────────┘
   ↓
DETERMINISTIC ALERT SERVICE
   ↓
CIVILIAN APP 🚨

That distinction is important because the agents create intelligence and coordination, while the platform controls the actual system state.

For development, I would stop after Phase V18 initially and test one thing on real devices:

Captain says “We've lost maneuverability” → confirms → Platform receives the event.

Then immediately connect that to the Civilian App alarm. Once those three pieces talk to each other, you already have the core of the SOGN SAFE ecosystem.