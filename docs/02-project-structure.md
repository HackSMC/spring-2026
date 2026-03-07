# Project Structure Convention

Think of this repository like your own room—if you keep things disorganized, you will spend more time looking for things than actually working. Follow these guidelines to keep our codebase maintainable.

## 1. Colocation (Local First)

Keep code as close as possible to where it is used. If a component, hook, or utility is specific to a feature, it belongs in that feature's folder.

- **Working Directory:** `app/<page>/`
- **Storage:** Create `components/`, `hooks/`, or `utils/` folders inside the relevant page directory.

### Examples

- `app/(root)/apply/components/`: Host all components belonging to the Apply page.
- `app/(root)/sponsors/hooks/`: Host all hooks belonging to the Sponsors page.

## 2. Naming Convention (Kebab-Case)

All component files and directories must use **kebab-case** (lowercase with hyphens). This ensures consistency and prevents issues with case-sensitive file systems.

- **Example:** `user-profile-card.tsx` instead of `UserProfileCard.tsx` or `user_profile_card.tsx`.

## 3. Shared Code (The "Rule of Three")

If a component, hook, or utility is used in **more than three pages or features**, it must be moved to the global directories to avoid duplication.

- **Global Directories:** `/components`, `/hooks`, or `/utils` located in the root directory.

---

### Quick Reference

| Scope                 | Location                               |
| :-------------------- | :------------------------------------- |
| **Page-specific**     | `app/<page>/components/`               |
| **Shared (3+ pages)** | `/components/`, `/hooks/`, `/utils/`   |
| **Naming Style**      | `kebab-case` (e.g., `main-button.tsx`) |
