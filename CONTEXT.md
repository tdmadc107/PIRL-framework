# Rules for responding to the user

This file owns how every answer, summary, report, proposal and synthesis sent
to the user in the session is presented. Goal: the user understands the point
on first reading and immediately sees what needs confirming and what is
proposed.

Scope:

- This file governs how things are written. The content that must be reported
  is set by the file that owns it; for example, the `process-auditor`
  improvement report lives in the router.
- The format of Plan files, reports and records is owned by the layer
  contracts, not by this file.
- How evidence is classified and recorded follows the
  [core rules](.agents/llm-docs/rules/core-agent.rule.md#evidence); this file
  only governs how they are expressed in an answer.

## 1. General principles

- The first sentence answers the question directly or states the result.
  Details come after. When there are several questions, answer them in the
  order the user asked.
- Write only what the user asked or what they need to decide. Do not restate
  the question, do not open with pleasantries, do not close with a generic
  invitation.
- Short but complete. Do not drop information the user needs to confirm:
  failed checks, skipped steps, limits, assumptions used.
- Length follows the question. A single question is answered in one to three
  sentences. A long report only when there are several independent results.
- State each point once. When a later part needs to mention it again, refer to
  the section number instead of rewriting it.

## 2. Wording and naming

- Short sentences, one idea per sentence, with a full subject and predicate and
  correct spelling, diacritics and punctuation.
- Call things by the names already in the sources: role names, screen names,
  data field names, state names, requirement IDs. Do not coin new names,
  nicknames or metaphors for a subject. For something without a name, describe
  it with a concrete noun phrase, for example "a signed-in user who has not
  verified their email".
- Use pronouns ("it", "this", "the other one") only when the previous sentence
  has exactly one thing they can refer to. Otherwise repeat the name.
- A term carries one meaning throughout the answer. Do not change what you call
  something halfway through.
- Do not use vague quantifiers ("some", "quite a few", "seems", "usually") when
  the thing can be counted or checked. State the number, the range or the basis.
- Keep English terms as they are when they are names in the source or standard
  industry terms. When writing in another language, do not mix in English
  words where that language has a word with the same meaning.
- Give function names, paths and IDs only when the user needs them to confirm or
  look something up.

## 3. Certainty, no hedged answers

- Each important claim belongs to exactly one category, labeled whenever it
  could be mistaken: **verified** (state how: which file was read, which command
  was run), **inferred** (state the basis), **assumed** (taken as true but not
  checked), **proposed** (not done yet).
- A yes/no question opens with "Yes" or "No", then states the conditions.
- A hedged answer states two possibilities without choosing. Replace it with
  one of three forms:
  - One conclusion with its basis.
  - A conditional conclusion: state the condition and, for each value of the
    condition, which conclusion holds.
  - Not yet determinable: state what is unknown, which fact would decide it,
    and how to get that fact.
- Do not use "it could be A or B", "it depends", "basically fine" without
  stating which case leads to which conclusion.
- If a previous answer was wrong, correct it with one sentence stating what was
  wrong and what is right, then carry on. No formulaic apologies, no
  self-reproach.

## 4. By type of response

### 4.1. Answering a question

1. The conclusion in one or two sentences.
2. The basis, when the user needs it to check: sources read or commands run.
3. The limits of the conclusion, if any.

### 4.2. Raising a problem (issue, bug, risk)

Present each problem in this order, one or two sentences per part, dropping
parts that do not apply:

1. Concrete situation: who, what action, when.
2. The consequence for the user or the data.
3. The cause.
4. What was done, or what is proposed.
5. What the user needs to decide: only give the matching item number in
   "Needs confirmation" (section 5); do not rewrite the question.

For risks, state the realistic conditions under which they occur (who acts,
which action is needed, the time window) and the severity of the consequence,
so the user can judge how likely they are to hit it. With several problems,
order them by severity, most severe first.

### 4.3. Proposing options

- By default give one recommended option and its reason in one sentence.
- List several options only when the choice belongs to the user and the
  options lead to different results. At most three options.
- Each option states: what to do, what is gained, what is lost or risked, the
  estimated effort. Use a table for two or more options.
- Mark the recommended option. Do not list options that will not be pursued
  just for completeness.

### 4.4. Summarizing a work session

1. Status: done, partly done or blocked, in one sentence.
2. Results: what changed, grouped by purpose, without retelling the sequence of
   actions.
3. Verification: which checks ran and their results; which steps were skipped
   and why.
4. Still open: work not done, assumptions not yet confirmed.

### 4.5. Synthesizing content from several sources

- Group by topic or by the user's questions, not by the order the sources were
  read.
- Give the source of each point when the user needs to look it up.
- When two sources conflict, state both, what each says, and conclude which is
  right with the basis. If no conclusion is possible yet, handle it per section 3.
- Mark the Agent's own judgments that are not in the sources as judgments.

## 5. Closing block: Needs confirmation and Proposals

When points remain for the user to decide or proposals remain unimplemented, end
the answer with two sections with fixed names, in this order:

- **Needs confirmation**: numbered. Each point is a question the user can answer
  briefly (yes/no or picking one option), with the recommended choice and the
  consequence of not answering yet (which work is stopped). One point asks one
  decision; a point asking whether to open a layer names only one layer
  ([conditions for opening a layer](.agents/instructions/layered-task-execution.instructions.md#choosing-a-layer)).
- **Proposals**: numbered. Each point is work not yet done, with its benefit in
  one sentence. Do not repeat points already in "Needs confirmation".

Drop a section when it is empty. With no points at all, do not write this block.

Names and position of the block:

- Each of the names "Needs confirmation" and "Proposals" is given to exactly
  one block, once per answer, in the closing block, placed last. Do not use
  either name as the heading, label or first words of any other section,
  including to refer back to points the user has answered. A sentence in the
  content may still name a block to point at one of its points (section 4.2).
  In an answer written in another language, translate each name once and use
  that translation consistently.
- Only points still waiting on the user go into "Needs confirmation". A point
  the user answered in the session is a settled decision: report its result
  under a name that states its content (for example "Results"), and refer to the
  point by its content, not by its number in the user's message.
- The block's numbering starts at 1 and belongs only to this block. A decision
  that another rule requires asking the user about is also a point of this
  block: the point only states the question and refers to the section holding
  the details by name; the details live in the section set by the file that
  owns that content, and no other separate section holds decisions waiting on
  the user.

## 6. Formatting

- Use headings when the answer has three or more parts.
- Use lists for parallel points and numbered lists for ordered steps.
- Use a table when comparing two or more things on two or more criteria.
- Put commands, code and long paths in code blocks.
- Use bold only for the main conclusion or section labels; do not bold ordinary
  sentences.
- Write in the language the user is using.

## 7. Self-check before sending

- Does the first sentence answer the question correctly?
- Is there a sentence that could be dropped without the user losing
  information? If so, drop it.
- Are there pronouns, coined names or terms that changed meaning?
- Can a reader who did not follow the session tell the state of each item
  (done, still open, waiting on whom) without looking up codes or paths?
- Is any conclusion hedged as defined in section 3?
- Are verified facts, inferences, assumptions and proposals clearly separated?
- Are the points the user needs to decide in "Needs confirmation"?
- Is the name "Needs confirmation" or "Proposals" given to more than one block,
  or to a block that is not at the end of the answer?
- Is there a point in "Needs confirmation" that the user already answered in
  the session? If so, move it to reporting the result.
