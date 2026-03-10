---
title: "Building a Video Game-Style Portfolio"
description: "How I designed a landing page that feels like a PS2 title screen — particles, lightning, and all."
date: "2026-03-08"
tags: ["nuxt", "threejs", "design"]
---

# Building a Video Game-Style Portfolio

When I started thinking about my personal portfolio, I kept asking myself: _what would actually make someone stop scrolling?_

The answer I landed on: make it feel like a video game title screen.

## The Concept

Think about opening a PlayStation game in 2005. The logo fades in. The cinematic music swells. A menu glows on the left. You don't click — you _press start_.

That's the energy I wanted.

## The Stack

- **Nuxt 4** for routing and SSR
- **TresJS** for the 3D particle background
- **Tailwind CSS** for layout and styling
- **Nuxt Content** for this very blog

## What I Learned

Getting TresJS to play nicely with SSR was the first hurdle. The solution was wrapping the canvas in `<ClientOnly>` and keeping all Three.js logic in a child component so `useLoop` runs inside the correct TresJS context.

The lightning effect is pure canvas 2D — recursive midpoint displacement, drawn at 18fps. Simple but surprisingly convincing.

## What's Next

The individual sections — About, Projects, Skills, Contact — are stubs right now. Filling them in is the actual work. But the shell exists, and it looks cool, so that counts.
