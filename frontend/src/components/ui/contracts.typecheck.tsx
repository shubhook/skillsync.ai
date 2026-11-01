// Compile-time checks for the design system's limits.
// This file is typechecked by `tsc -b` but never imported, so it doesn't ship.
import Action from './Action';
import Card from './Card';
import DifficultyMeter from './DifficultyMeter';

export const allowed = (
  <>
    <Action>Generate</Action>
    <Action as="a" variant="link" href="/docs">Starter docs</Action>
    <Action as="span" variant="ghost">Batch 2</Action>
    <Card as="li" density="compact">Bookmark</Card>
    <DifficultyMeter difficulty="Beginner" />
  </>
);

export const forbidden = (
  <>
    {/* @ts-expect-error Action may only render as button, a, or span. */}
    <Action as="div">Nope</Action>
    {/* @ts-expect-error Only the four roles exist. */}
    <Action variant="outline">Nope</Action>
    {/* @ts-expect-error Card densities are default and compact. There is no featured card. */}
    <Card density="featured">Nope</Card>
    {/* @ts-expect-error Card may only render as article, div, or li. */}
    <Card as="section">Nope</Card>
  </>
);
