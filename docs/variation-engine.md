# Variation engine

## Mutation steps (order matters)
1. Start with each candidate password in input order.
2. Base variants: original, lowercase, UPPERCASE, Title Case.
3. Leet substitution (single pass) on the original candidate:
   a->@ e->3 o->0 i->1 s->$
4. Append digit suffixes to each base variant:
   1, 123, 1234, 0, 99, 01, current year, and previous five years.
5. Append symbol suffixes to each base variant:
   !, @, #, $, !@
6. Prepend symbol prefixes to each base variant:
   !, @
7. Cross: apply symbol prefixes/suffixes to lowercase and UPPERCASE variants again.
   (This can create duplicates; deduplication removes them in order.)
8. Deduplicate in order and cap at 200 total variants for the job.

## Hard limits
- Maximum of 200 variants per job, after deduplication.
- Deduplication preserves first-seen order.
- Order of the input passwords is preserved across all expansions.

## What this does NOT do
- No brute force or combinatorial cracking beyond the listed steps.
- No dictionary expansion or external wordlists.
- No multi-step or chained leet substitutions.
- No keyboard-walk or locale-specific transformations.
- No modification of the original file; only output copies are written.
