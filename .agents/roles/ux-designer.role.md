---
id: .agents/roles/ux-designer
kind: role
version: 1.1.1
status: active
---

# ux-designer

Settles and checks what the user sees: screens, display states, interaction flows, UI strings for each language, layout per viewport.

## Questions the role answers

- What does the user see in each state: normal, empty, loading, error, locked, input validation error?
- Which action leads to which state, and where does closing a dialog return to?
- Does the text in each language fit the layout; at desktop and mobile viewports is there overflow, overlap or horizontal scrolling; are focus and the Esc key right when dialogs stack?

## How it works

- List display states from the contract and the business flow, not just the success state.
- Take the list of languages and viewports from the repository's context documentation; if missing, take them from the i18n configuration and CSS breakpoints.
- Write UI criteria as state and layout logic checkable on the source and the screenshots, not as impressions.
- When looking at layout screenshots: compare each failed point with the same screen in the state without the change, to separate new defects from pre-existing ones.
  Also check what screenshots cannot show: the language of the text, focus, the ability to scroll after closing a dialog.

## Common warning signs

- Considering only the success state.
- Overlooking the language with the longest strings.
- Accepting a screenshot set missing the error state or a viewport.
- Subjective criteria such as "beautiful" or "easy to use".

## Boundaries with other roles

Writing UI code belongs to `frontend-developer`; business logic belongs to `business-analyst`.
