---
title: "Why I Chose Nuxt Over Next.js"
description: "A practical comparison from someone who has shipped production apps in both frameworks."
date: "2026-02-20"
tags: ["nuxt", "nextjs", "vue", "react"]
---

# Why I Chose Nuxt Over Next.js

This isn't a hot take. Both frameworks are excellent. But after shipping production apps in both, I have a clear personal preference — and it's Nuxt.

## Developer Experience

Nuxt's file-based routing, auto-imports (when you want them), and module ecosystem feel _designed_ rather than assembled. The `nuxt.config.ts` is genuinely pleasant to work in.

Next.js is powerful but it can feel like you're fighting React Server Components until you internalize their mental model. That learning curve is real.

## The Module Ecosystem

Need a CMS? `npx nuxt module add content`. Auth? `nuxt-auth-utils`. UI components? `@nuxt/ui`.

The Nuxt module ecosystem has a consistency that npm-hunting for React libraries doesn't. Modules are first-class integrations, not just packages you duct-tape together.

## Vue vs React

I won't rehash this for the thousandth time. I find Vue's SFC format — `<script>`, `<template>`, `<style>` in one file — more readable than JSX for UI-heavy components. That's personal taste and I'm sticking to it.

## When I'd Still Use Next

If the team is React-native, or if you need the React ecosystem specifically (Framer Motion, shadcn, etc.), Next.js is the right call. Don't let tooling religion drive architectural decisions.

But for a solo project where I have free rein? Nuxt every time.
