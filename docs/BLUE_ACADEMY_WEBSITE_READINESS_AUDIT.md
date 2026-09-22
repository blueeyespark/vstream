# Blue Academy Website Readiness Audit

Date: 2026-09-22
Scope: current VStream branch `feature/platform-independence`
Purpose: identify structural flaws before turning the website into the foundation for Blue Academy.

## Executive finding

The current site contains useful learning prototypes, but it is not yet a college platform. The strongest path is to keep VStream/CreatorOS as the creator/professional side and add an Academy application surface backed by shared identity, Blue Core, files and infrastructure.

## Critical blockers

### 1. No Academy information architecture or routes
`src/App.jsx` has VStream/creator routes but no Academy home, student dashboard, course room, faculty dashboard, assignments, gradebook, calendar, registrar/profile, accommodations, or portfolio review route.

Recommendation: create an `/Academy` shell with role-aware subroutes instead of hiding school features inside CreatorStudio.

### 2. Learning Hub is a course catalog prototype, not an academic course system
`src/components/studio/LearningHub.jsx` imports large static JS course datasets and displays marketing-style counts such as "200+ courses" and "17 skill domains." This is not a database-backed catalog with course ownership, terms, sections, instructors, prerequisites, syllabus versions, enrollment rules, capacity, meeting format or published/draft state.

Recommendation: model Program -> Course -> Section -> Module -> Lesson -> Assignment/Assessment and separate catalog metadata from live course sections.

### 3. Student/faculty/admin roles are not modeled for school operations
Current UI behavior largely derives from generic VStream roles such as viewer/admin/staff/owner/editor. Academy needs distinct scoped roles and relationships: student, instructor, teaching assistant, advisor, registrar/admin, reviewer and possibly partner-lab staff.

Recommendation: do not overload VStream creator roles. Add scoped memberships/permissions per Academy organization/course/section.

### 4. Current owner-only entity security conflicts with classrooms
The owned generic entity API intentionally limits entities to their owner. That is good for private creator data but cannot by itself support a professor sharing a course with enrolled students, team submissions, instructor feedback, class Q&A, or grade access.

Recommendation: add explicit ACL/membership policies. Never solve this by making generic entities globally readable.

### 5. Existing Q&A/team collaboration assumes shared data that the current backend does not provide
Learning components use generic entities for questions, answers and team projects. With owner isolation, different users will not naturally see the same classroom resources. `TeamWorkspace.jsx` also calls `platform.entities.*`, but the current owned client exposes entities through the separate entity registry rather than `platform.entities`, making this a likely broken migration path.

Recommendation: create owned Academy collaboration endpoints/services with enrollment-aware authorization.

### 6. Quiz generation still calls an unported legacy function
`QuizModule.jsx` invokes `generateQuizQuestions`. The owned function router has not implemented this function, so the current AI-generated quiz experience is not a reliable Academy capability.

Recommendation: move quiz assistance through Blue Teacher with instructor-approved question banks/policies. AI-generated assessment content should be clearly distinguished from instructor-authored graded assessments.

### 7. No authoritative gradebook / submission lifecycle
The prototype records quiz scores and enrollment progress, but there is no robust assignment lifecycle:
draft -> assigned -> submitted -> late/resubmitted -> under review -> returned -> revised -> final.
There is no authoritative gradebook, rubric versioning, instructor override/audit, feedback release state, or separation between practice/mastery signals and official grades.

Recommendation: build submissions and grading as first-class owned services. Blue may assist but must not silently become the authoritative grader.

### 8. No real academic file workflow
The school vision depends on real professional project files (for example Blender, code repositories, images/video). Current storage is private local upload/download with a 512 MiB default server limit. It lacks project-file version history, assignment snapshots, instructor annotations, large-file/object-storage workflow, portfolio promotion, and controlled sharing.

Recommendation: build Project Files + Submission Snapshots + Version History. Use object storage/multipart uploads before claiming multi-GB creative project support.

## High-priority product flaws

### 9. Two Blue surfaces are currently mounted
`src/App.jsx` globally mounts `VStreamAIAssistant`, while `src/Layout.jsx` also mounts the older `AIAssistant`. They now share more Blue infrastructure, but the duplicate presentation can confuse users and risks two floating assistants/check-in systems.

Recommendation: one global Blue shell. Reuse avatar/check-in/personality pieces inside that shell.

### 10. Blue does not yet have Academy authorization boundaries
Teacher mode and Academy memory scope exist conceptually, but there is not yet a course authorization service defining exactly which syllabus, lesson, submission, instructor feedback or student record Blue may access.

Recommendation: every Blue Academy tool should derive access from the same enrollment/course ACL as the human user.

### 11. Learning navigation is mixed into CreatorStudio
Education currently behaves like a CreatorOS feature. A college needs its own mental model and navigation while still connecting to Creator Campus/VStream.

Recommendation:
- VStream = public/professional creator network.
- CreatorOS = production/business workspace.
- Academy = college.
- Shared Blue, account, projects/files and portfolio bridge them.

### 12. Static/random catalog behavior undermines academic trust
Featured courses are shuffled with `Math.random()` on render. Several skill tabs are present even though the underlying course selection logic only maps a smaller set of course types. This can create inconsistent or empty/mismatched experiences.

Recommendation: deterministic recommendations backed by catalog metadata, enrollment history and explicit recommendation logic.

### 13. "Continue" course flow is incomplete
My Courses displays progress and a Continue button, but the inspected component does not establish a complete lesson-room navigation flow with syllabus/module state, materials, assignment due dates, instructor presence and Blue lesson context.

Recommendation: Course Room should be the center of the student experience.

### 14. Gamification is too close to academic progress
XP, badges, streaks and time invested can be useful motivation, but they should not visually or structurally substitute for mastery, competencies, assignment status, credits or grades.

Recommendation: make gamification optional/supporting. Keep official academic progress separate.

### 15. Certificates are not credentials
The existing certificate UI/data can support completion awards, but a real college credential requires institutional policies and, where applicable, authorization/accreditation processes outside the software.

Recommendation: label prototype certificates accurately and design a credential service without making accreditation claims.

## Privacy, security and accessibility risks

### 16. Student records need a dedicated privacy boundary
Academy introduces grades, submissions, feedback, accommodations and potentially education records. These should not share casual visibility rules with public creator/social data.

Recommendation: separate education-record data domains, audit access, export/access workflows, retention/deletion policies and third-party data-sharing controls.

### 17. Production authentication is incomplete
Owned development auth exists, but production OAuth/identity is not complete. A school needs stronger account recovery, MFA strategy, session/device management and elevated-role protections.

### 18. Accessibility must be designed before spatial features
The existing visual design relies heavily on custom dark styling, dense cards, icons, gradients and interactive controls. Academy must support keyboard navigation, semantic labels, focus states, screen readers, captions/transcripts, scalable text, reduced motion and non-XR equivalents.

Spatial/XR can enhance a course but cannot be the only way to access required learning.

### 19. Demo/public creator content must be clearly separated from school records
The VStream dashboard includes demo videos/channels/social pulse. Academy should never make demo/social/public content visually indistinguishable from official course announcements, instructor material or academic records.

## Missing school systems

Before calling the site a college platform, plan explicit services/UI for:
- Academy home and onboarding
- program/major catalog
- course catalog and prerequisites
- terms/semesters and course sections
- enrollment
- syllabus
- Course Room
- modules/lessons
- assignments
- submissions/version history
- rubrics/feedback
- gradebook
- faculty dashboard
- office hours/appointments
- announcements
- course discussions
- team projects
- academic calendar
- notifications
- accessibility/accommodations workflow
- student portfolio
- academic progress/mastery
- advising
- records/export
- institutional/admin tools
- partner physical lab scheduling later

## Recommended first school slice

Do not build all of the above at once. Prove one real course end-to-end:

**3D Modeling Fundamentals**
1. Student signs in.
2. Enrolls in a real section.
3. Opens Course Room.
4. Sees instructor, syllabus, modules and due work.
5. Opens/downloads a real Blender starter project.
6. Blue Teacher receives only authorized lesson/project context.
7. Student submits a versioned `.blend` snapshot.
8. Instructor reviews with rubric/annotations.
9. Student receives feedback and revises.
10. Final project is marked complete.
11. Student explicitly promotes eligible work to Portfolio.
12. Student may explicitly publish eligible portfolio work to VStream.

That vertical slice will expose missing infrastructure faster than adding hundreds of static courses.

## Site architecture target

```text
Shared Account + Identity
        |
        +-- Blue Core
        |    +-- conversations
        |    +-- scoped approved memory
        |    +-- tools/permissions/actions/results
        |
        +-- VStream
        |    +-- watch/live/shorts/community
        |
        +-- CreatorOS
        |    +-- production/projects/business
        |
        +-- Blue Academy
             +-- Student
             +-- Faculty
             +-- Course Room
             +-- Projects/Submissions
             +-- Feedback/Grades
             +-- Portfolio bridge
```

## Immediate engineering order

1. Consolidate the duplicate Blue UI into one global Blue shell.
2. Define Academy data model and ACL/membership model.
3. Add Academy route shell and role-aware navigation.
4. Build Course/Section/Enrollment/Course Room.
5. Build Assignment/Submission/Rubric/Feedback.
6. Build versioned professional project files.
7. Wire Blue Teacher to course-authorized tools.
8. Replace legacy quiz generator with owned Teacher-mode assessment support.
9. Add privacy/access/audit controls.
10. Run keyboard/screen-reader/responsive/accessibility testing.
11. Only then expand course catalog and spatial/XR layers.

## Principle

Blue Academy should not be "VStream with a Courses tab." It should be a real academic application sharing Blue, identity, files, creator infrastructure and portfolio pathways with VStream.
