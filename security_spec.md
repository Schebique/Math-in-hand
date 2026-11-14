# Firestore Zero-Trust Security Specification (MathHero)

## 1. Data Invariants
1. **Strict Tenant Isolation**: Every document under `/users/{userId}` (including `private`, `settings`, `students`, and `history`) can only be read or written when `request.auth != null`, `request.auth.token.email_verified == true`, and `request.auth.uid == userId`.
2. **Ownership Integrity**: Every child document (`students`, `history`, `settings`, `private`) must carry `ownerUid == request.auth.uid` (or `uid == request.auth.uid`), and `ownerUid` / `uid` / `createdAt` are immutable once created.
3. **PII Isolation**: User `email` is stored exclusively inside `/users/{userId}/private/profile`, never in shared or top-level paths.
4. **Master Gate Integrity**: Subcollection writes (`settings`, `students`, `history`, `private`) verify the parent `/users/{userId}` document exists.
5. **Bounded Types & Sizes**: All strings enforce exact `.size()` bounds matching `firebase-blueprint.json`; all arrays (`allowedGrades`, `unlockedAvatars`, `unlockedBadges`) are bounded (`size() <= 30`) and type-checked.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Yield PERMISSION_DENIED)
1. **Cross-Parent Get**: Authenticated Parent B (`uid_B`) calls `get(/users/uid_A/students/st_1)`.
2. **Cross-Parent List**: Authenticated Parent B (`uid_B`) queries `list(/users/uid_A/students)`.
3. **Unverified Email**: Authenticated user with `email_verified: false` writes to `/users/uid_A`.
4. **UID Spoofing on Create**: Parent B creates `/users/uid_B/students/st_1` with `ownerUid: "uid_A"`.
5. **Ghost Field Injection**: Parent A includes `isAdmin: true` in a student update payload.
6. **ID Poisoning**: Parent A creates a student with a 500-character document ID containing `$` or `/`.
7. **Oversized String DoS**: Parent A writes a 50KB `name` string into `/users/uid_A/students/st_1`.
8. **Owner Mutation on Update**: Parent A attempts to update `ownerUid` to `"uid_B"` on an existing student.
9. **Timestamp Spoofing**: Client sets `createdAt` to an arbitrary client integer instead of `request.time`.
10. **PII Read Leak**: Unauthenticated or cross-tenant user reads `/users/uid_A/private/profile`.
11. **Array Type/Size Poisoning**: Client writes 100 entries into `unlockedBadges` or `[123]` instead of strings.
12. **Orphan Subcollection Write**: Client writes `/users/uid_A/history/h1` before `/users/uid_A` exists.
