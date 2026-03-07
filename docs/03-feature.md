# Feature-Based Architecture

When a task grows beyond a simple page-level component, please seperate them into its own module/feature. This file outlines how we handle complex features.

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
