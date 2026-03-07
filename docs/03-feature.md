# Feature-Based Architecture (OPTIONAL)

When a task grows beyond a simple page-level component, please separate them into its own module/feature. This file outlines how we handle complex features.

## When to use `/features`

Move your code into the root `/features` directory when:

- The feature contains multiple related components, hooks, and utilities.
- The logic is complex enough that it would clutter the `app/` directory.
- The feature is large enough to potentially be reused or isolated as a standalone module.

## Structure

By placing features in the root, we separate "feature business logic" from "routing/page logic."

```text
/features
  /<feature-name>
    /components
    /hooks
    /utils
    /types
    /index.ts  # Export the public API of the feature
```

## Concrete Example: "Application"

Consider an `Application` feature. Because this involves complex form handling, specific validation logic, and multiple UI states, it is managed as a standalone feature rather than living inside a single page folder. Plus, it may be used on pages like the `Apply` page and some parts of the `dashboard`

- **Why it lives in `/features/application`**: Again, the application process needs to be accessible from multiple places, such as the Apply Page, the User Dashboard (for status tracking), and potentially an Admin Panel.

- **Usage**: By centralizing it, you ensure that the same validation logic and UI components are consistent across all these entry points.

```text
/features
  /application
    /components
      /application-viewer.tsx
    /hooks
      /use-application.ts
    /utils
      /accept-deny-app.ts
    /types
      /application-dto.ts
```
