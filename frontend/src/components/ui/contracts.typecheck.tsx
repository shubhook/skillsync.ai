// Compile-time checks for the design system's "50% polymorphism" limits.
// This file is typechecked by `tsc -b` but never imported, so it doesn't ship.
import Action from './Action';
import Badge from './Badge';
import Card from './Card';

export const allowed = (
  <>
    <Action>Generate</Action>
    <Action as="a" variant="link" href="/docs">Starter docs</Action>
    <Action as="span" variant="ghost">Batch 2</Action>
    <Card as="li" density="compact">Bookmark</Card>
    <Badge tone="beginner">Beginner</Badge>
  </>
);

export const forbidden = (
  <>
    {/* @ts-expect-error Action may only render as button, a, or span. */}
    <Action as="div">Nope</Action>
    {/* @ts-expect-error Only the four roles exist. */}
    <Action variant="outline">Nope</Action>
    {/* @ts-expect-error Card densities are default, compact, featured. */}
    <Card density="hero">Nope</Card>
    {/* @ts-expect-error Card may only render as article, div, or li. */}
    <Card as="section">Nope</Card>
    {/* @ts-expect-error Badges never use the accent. */}
    <Badge tone="accent">Nope</Badge>
  </>
);
