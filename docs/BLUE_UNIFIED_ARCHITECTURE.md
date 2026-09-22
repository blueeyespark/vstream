# Unified Blue Architecture

## Source of truth

Blue is not defined by one repository, one model, or one UI. The product definition is synthesized from:

1. The Project Blue design decisions developed with the creator: teacher-first/default Blue, a full coding workbench, desktop assistance, creator/stream management, VRChat workflows, cross-device identity, local-first plus optional cloud models, scoped permissions, memory, agent workflows, and Blue Academy.
2. VStream's existing Blue/VStream AI surfaces and creator context.
3. The complete eight-commit history currently present in `blueeyespark/AI-VTUBER`, reviewed from the initial Project Blue v3.3 release through the Project Blue workspace initialization.
4. The Project Blue design bible, status audits, tests, and capability inventories in AI-VTUBER.

Historical code is evidence and inspiration, not automatically production code. We preserve good ideas while rebuilding them behind Blue-owned platform boundaries.

## Identity rule

There is one Blue identity. VStream Blue, Academy Blue, CreatorOS Blue, desktop Blue, phone Blue, Quest/XR Blue, and future spatial-glasses Blue are modes/surfaces of the same identity.

The identity must be independent of the active model/provider. Personality, constitution, permissions, memory policy, project context, provenance, and relationship state survive provider changes.

## Default face: Teacher

Blue's default experience is Teacher. Other modes change tools and visible workspace, not Blue's identity.

- Teacher: explain, diagnose confusion, teach-back, mastery tracking, mistake journal, knowledge verification.
- Build: IDE/workbench, files, search, terminal, Git, language services, debugging, tests, plan-edit-run-fix-verify.
- Creator: ideas, photography/video, ArtForge, avatars, VRChat workflows, production, publishing, portfolio.
- Stream: OBS/live planning, chat/moderation, scenes, run-of-show, platform rules.
- Desktop: approved app/file/clipboard/screen workflows and automation.
- Companion: conversation, voice, avatar/presence, reminders and daily guidance.

## Core services

```text
Blue Identity
  -> Constitution / policy
  -> Memory + provenance + knowledge graph
  -> Project/context service
  -> Capability truth registry
  -> Provider router (local/cloud/coding/vision/speech/research)
  -> Command + agent planner
  -> Permission / approval engine
  -> Action ledger + verification + rollback
  -> Presence / device sync (BlueMesh evolution)
  -> Result system
```

Provider APIs are replaceable adapters. No external AI vendor owns Blue's identity, memory, permissions, or application architecture.

## Permission model

Capability permissions are separate from human collaboration roles.

Action levels:
- Observe
- Guide
- Work With Me
- Trusted
- Full Task

Sensitive actions remain approval-gated even when a broad mode is enabled. Blue must support an emergency stop, action history, reason/evidence, affected systems, risk, approval, result, verification, rollback, timestamp, actor, and provider/tool.

Human collaboration roles such as Creator, Co-Creator, Steward, Contributor, and Viewer determine access to shared resources; they do not silently grant machine-control permission.

## Capability truth

Every Blue capability reports one of:
- working
- partial
- planner-only
- approval-gated
- unavailable

Blue must never turn a missing backend into a fake success. A successful task ends with verification when verification is possible.

## Memory and learning

Blue learns only through approved sources and records provenance where possible. It separates verified knowledge, user-provided facts, hypotheses, and ideas. Secret-like material is excluded from device sync. Memory should be inspectable and scoped by identity/project/persona.

Academy learning adds mastery state, mistakes, teach-back results, instructor feedback, project revisions, and portfolio progression without exposing private creator/desktop context to a course by default.

## Workspace result system

All meaningful actions produce typed results rather than disappearing into chat:
- message
- file/artifact
- research note
- diff
- diagnostic
- image/media result
- task/lesson plan
- stream plan
- approval request
- execution report

Results can open in workspace tabs and link back to the conversation/action that produced them.

## Cross-device Blue

BlueMesh evolves into the synchronization layer for the same Blue across trusted devices. Git remains appropriate for source history; BlueMesh handles approved identity/memory/settings/live-state synchronization, trusted-node pairing, conflicts, and an append-only ledger.

Targets: PC/web first, then phone and Quest/XR, with future spatial glasses as an interface rather than the host of Blue's intelligence.

## Creator and streaming inheritance

Preserve the strongest AI-VTUBER concepts:
- desktop companion and expressive avatar/presence
- OBS-safe transparent avatar output
- streaming preflight and moderation
- platform adapters
- voice provider abstraction
- creator project workspace
- BlueMesh conflict review
- Daily Compass / self-audit
- capability inventory
- safe workspace agent
- local OCR/vision where appropriate

VStream adds creator lifecycle context: Idea -> Plan -> Create -> Edit -> Package -> Publish -> Promote -> Analyze -> Monetize -> Community.

## Academy integration

Blue Academy uses the same Blue Core but a scoped Academy persona/context. Human instructors remain central. Blue can inspect the student's authorized lesson/project files, explain what is blocking them, help them learn the underlying skill, and support revision without pretending to replace the instructor.

## Immediate implementation order

1. Finish VStream platform independence and keep the zero-Base44 CI gate.
2. Implement the Blue provider router behind `/v1/ai/*`.
3. Add capability truth and provider health.
4. Add conversation/result persistence and typed workspace results.
5. Add permission/approval/action-ledger primitives.
6. Merge VStream AI surfaces onto one Blue client/context.
7. Add Teacher as the default mode and Academy-scoped context.
8. Port useful desktop/creator/stream/BlueMesh capabilities as services rather than copying the old monolith.
9. Add phone/Quest clients against the same contracts.

## Historical AI-VTUBER commit review

The repository currently exposes eight commits, all reviewed as architectural evidence:

- `93f03a7` Initial Project Blue v3.3 release — local core, constitution, storage/memory, providers, desktop pet/control center, security, data center.
- `b65ff5a` Expand Project Blue desktop companion — richer avatar/Live2D/VRM, phone app, providers, desktop companion.
- `734d153` Enable joint creator approval for shared BlueMesh upgrades — multi-creator approval and BlueMesh update management.
- `f4d1a00` Build Project Blue UI, mesh, streaming, and companion systems — workbench shell, companion engine, streaming, presence, BlueMesh UI, safety/tests.
- `7427e7f` Update workspace progress — workspace evolution and integration work.
- `c6d28d4` Project Blue V8 intelligence foundation — deeper intelligence/service foundation.
- `adaeac7` Stabilize Project Blue app and Blue Next workspace — Daily Compass, workspace results, command routing, Quest companion, design-bible consolidation, capability audits.
- `c515fd9` Initialize Project Blue workspace — avatar/model workspace assets and current workspace initialization.

Do not discard an older idea merely because a later commit removed or reorganized its implementation. Use commit history to recover intent, then implement against the current owned architecture.
