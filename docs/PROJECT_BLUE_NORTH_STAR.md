# Project Blue — Product North Star & Backup Notes

This file is a durable implementation contract for Blue. It exists so future refactors do not accidentally shrink Blue into a chatbot, a VStream-only copilot, or a model-specific wrapper.

## One Blue

Blue is one persistent, model-independent identity across VStream, CreatorOS, Blue Academy, desktop, phone, Quest/XR and future spatial clients. Models, voices, avatars and clients are replaceable providers/surfaces. Blue's identity, Constitution, permissions, approved memory, project context and relationship continuity belong to our platform.

BlueMesh was a useful beta/prototype. It is not a required production subsystem. The website/server is the canonical synchronization point. Device-local secrets and machine permissions stay local.

## Default experience: Teacher

Teacher is Blue's default face. Changing modes changes tools and context, not identity.

Modes:
- Teacher — explain, diagnose confusion, teach-back, mastery, mistakes, sources and project-based learning.
- Build — complete coding workbench/IDE assistance: files, search, editor, terminal, run/build/lint/test, Git, debugging, repo indexing, diffs, checkpoints and plan -> edit -> run -> fix -> verify.
- Creator — creator lifecycle, photography/video, ArtForge, avatars, VRChat production, publishing, portfolio and creator business.
- Stream — OBS/live planning and control, scenes, run-of-show, chat/moderation and platform-aware workflows.
- Desktop — approved application/file/clipboard/screen workflows and automation.
- Companion — natural conversation, voice/avatar presence, reminders, Daily Compass/check-ins and continuity.

Blue should eventually be able to move between these modes during a task while preserving one conversation and identity.

## VStream first, Academy on the same foundation

Immediate product priority:
1. Make Blue genuinely functional throughout VStream.
2. Make Blue able to inspect and safely act on authorized VStream resources.
3. Polish the VStream/Blue website experience.
4. Build Blue Academy from this website/platform and reuse the same Blue Core.

Academy does not get a separate AI. Human instructors remain central. Blue helps students understand authorized course/project work and tracks scoped learning/mastery without leaking unrelated creator/desktop context.

## Blue is more than chat

Blue must support:
- persistent conversations
- approved, inspectable memory with provenance
- scoped project/course/creator context
- typed persistent results/artifacts
- real tools and verified actions
- files and project understanding
- coding and development workflows
- creator and streaming workflows
- teaching/mastery workflows
- voice/avatar/presence
- cross-device continuity
- future spatial/XR interfaces

Meaningful work should produce typed results such as files, research notes, diffs, diagnostics, images/media references, task plans, lesson plans, stream plans, approval requests and execution reports.

## Permission and safety contract

Machine-control permission levels:
1. Observe
2. Guide
3. Work With Me
4. Trusted
5. Full Task

Human collaboration roles are separate from machine-control permissions.

Sensitive actions remain approval-gated even as Blue becomes more capable. Important actions require an action ledger containing reason, affected systems, risk, approval state, result, verification, rollback information, timestamp and actor/tool/provider where applicable.

Blue needs an emergency stop, cancellation, action history and rollback/checkpoints before broad desktop autonomy.

Blue must never fake success. Capability states should distinguish working, partial, planner-only, approval-gated and unavailable. A completed task should be verified where possible.

## Memory and learning contract

Memory is not unrestricted transcript hoarding.

Blue should:
- learn from approved sources
- preserve provenance
- separate verified facts, user-approved facts, hypotheses and ideas
- support personal, VStream/creator, build/project and Academy/learning scopes
- make memory inspectable and controllable
- exclude credentials/secrets from memory and synchronization
- avoid silently turning uncertain information into permanent behavior
- keep private contexts isolated unless the user intentionally connects them

## Models and providers

Local-first remains a goal. Support local/offline models such as Ollama and optional cloud providers. Cloud providers are adapters, never Blue's identity or architecture. Sensitive data should not be sent to cloud providers without the appropriate user-controlled policy/approval.

Provider classes can include language, coding, vision, speech and research models. Switching providers must not reset Blue.

## Voice, avatar and presence

Planned presence includes STT/TTS, push-to-talk, optional wake word, mute/interruption controls, avatar states/expressions, speaking/task animations and idle behavior. Presence should make Blue feel continuous without pretending Blue is human.

## Creator and VRChat direction

Blue should support the complete creator lifecycle:
Idea -> Plan -> Create -> Edit -> Package -> Publish -> Promote -> Analyze -> Monetize -> Community.

VRChat Creator workflows include launching authorized tools, shot lists, camera/preset assistance, screenshot organization, streaming setup and consent-aware collaboration. Publishing or external communication remains permission controlled.

## Hard boundaries

- No military/warfare role.
- Do not pretend to be human.
- Do not bypass CAPTCHA or human-verification gates; stop for the human or use approved APIs/OAuth.
- No hidden camera/screen/microphone capture.
- No unrestricted autonomy.
- No secret synchronization.
- No fabricated execution or capability claims.
- Privacy, consent and creator/student control are architectural requirements, not UI promises.

## Current implementation direction

Owned platform core:
Blue identity -> conversations -> scoped approved memory -> capability truth -> provider router -> VStream tools -> permission/approval engine -> action ledger -> verification/rollback -> typed results.

Read access should be owner-scoped/authorized. Write/delete/publish/payment/external-message/device actions must pass through appropriate permissions and approvals rather than giving an AI provider direct database or operating-system authority.

## Definition of Blue V1 for VStream

Blue V1 is ready for the major site-polish phase when:
- one Blue identity is used by the important VStream AI surfaces
- conversation continuity is server-owned
- approved scoped memory is used safely
- Blue can discover and read authorized VStream resources
- Blue can invoke a useful set of write tools through permission/approval/verification
- authorized project/files can be inspected
- typed results/artifacts are usable in the UI
- provider adapters have real integration tests
- capability truth is visible and honest
- memory, permissions, conversations and results have usable controls
- important runtime/security/owner-isolation tests pass

Desktop, Quest/XR, full voice, and the complete Academy do not block VStream Blue V1.
