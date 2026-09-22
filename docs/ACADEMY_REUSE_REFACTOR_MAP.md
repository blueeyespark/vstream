# Academy Reuse & Refactor Map

Blue Academy should preserve the useful learning work already built in VStream. Existing components are prototypes/assets, not disposable code and not automatically production-ready.

## Rule

For each existing learning feature choose one:
- **Keep** — sound concept and implementation can remain with light polish.
- **Move** — useful implementation belongs under the Academy application rather than CreatorOS.
- **Refactor** — useful idea, but data/auth/UX must be rebuilt.
- **Bridge** — shared between Academy and CreatorOS/VStream through an explicit boundary.
- **Retire only after replacement** — do not delete useful behavior before its replacement works.

## Existing learning work

### LearningHub — MOVE + REFACTOR
Preserve:
- subject/category discovery
- search/filter concept
- learning paths
- visual course cards
- broad skill coverage

Change:
- move primary experience from CreatorStudio into Academy
- replace static course arrays with owned catalog records
- replace random featured courses with deterministic recommendations
- distinguish catalog course from live course section
- remove unsupported marketing counts until backed by real data

### MyCourses — MOVE + REFACTOR
Preserve:
- enrolled/in-progress/completed views
- progress visualization
- continue-learning concept
- learning-time insight

Change:
- make Student Dashboard/Course Room the source of truth
- separate official academic progress from gamification
- use enrollment/section/module records rather than loose generic entities
- Continue opens an actual lesson/module

### CourseQnA — MOVE + REFACTOR
Preserve:
- student questions
- answers
- best-answer concept
- course-scoped discussion

Change:
- enrollment-aware visibility
- instructor/TA identity and moderation
- notifications
- audit/edit policy
- Blue can suggest/explain but must not impersonate faculty

### QuizModule — REFACTOR
Preserve:
- practice quizzes
- missed-topic tracking
- remediation concept
- immediate feedback

Change:
- remove dependency on legacy generateQuizQuestions
- route practice generation through Blue Teacher
- separate practice/AI quizzes from official graded assessments
- instructor-approved question banks/rubrics for authoritative grading

### TeamWorkspace — MOVE + REFACTOR
Preserve:
- team projects
- members
- project files
- project status

Change:
- fix old platform.entities path
- enrollment/team ACL
- versioned files
- submission snapshots
- instructor access
- project comments/feedback
- portfolio promotion after course completion

### BadgeDisplay / XP / streaks — KEEP AS OPTIONAL SUPPORT
Preserve motivation layer, but never substitute XP/time/streaks for credits, mastery, grades or assignment status.

### CertificateDisplay — BRIDGE / REFRAME
Keep completion awards. Do not represent a generated certificate as an accredited degree/credential. Future official credential service must be policy-backed.

### OfflineDownload — KEEP CONCEPT, REFACTOR SECURITY
Offline course material is valuable. Add expiring/authorized manifests, versioning and revocation rules for protected materials.

### LearningTimeAnalytics / TimeTracker — KEEP + POLISH
Useful student self-management signals. Do not treat time spent as proof of mastery.

### LearningPathGenerator — REFACTOR INTO BLUE TEACHER
Preserve personalized path idea. Blue should use actual program requirements, prerequisites, completed work and student goals rather than generating an unconstrained path.

### Static course data libraries — MIGRATION SOURCE
`creatorCoursesData.js`, `artistCoursesData.js`, and `expandedCoursesData.js` are idea/content inventories. Do not delete them until useful course concepts are imported into the Academy catalog. They should not remain the production database.

## New Academy structure

```text
src/academy/
  shell/
  student/
  faculty/
  catalog/
  course-room/
  assignments/
  submissions/
  grading/
  discussions/
  teams/
  portfolio/
  blue/
```

Do not physically move every file immediately. First create stable Academy services/routes, then migrate components incrementally to avoid breaking existing work.

## Shared bridges

Academy <-> CreatorOS:
- professional projects
- project files
- portfolio
- creator tools
- ArtForge where course-authorized
- production tools

Academy <-> VStream:
- optional publication of eligible portfolio work
- public showcases/events
- creator communities where appropriate

Academy <-> Blue:
- Teacher mode
- course-authorized context
- mastery/mistake memory
- project inspection
- practice/remediation
- assignment help under instructor/course policy

Private grades, accommodations, instructor-only material and unreleased submissions never become VStream/CreatorOS public context merely because the same account is used.

## Migration rule

Every moved feature should pass:
1. existing useful behavior preserved,
2. owned backend used,
3. authorization defined,
4. loading/error/empty states defined,
5. mobile + keyboard behavior checked,
6. Blue access explicitly scoped,
7. no Base44 dependency,
8. no fake/demo academic state presented as authoritative,
9. old component removed only after replacement is verified.
