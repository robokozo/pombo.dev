---
title: "Getting TresJS Working with Nuxt 4"
description: "The exact gotchas I hit integrating TresJS into a Nuxt 4 project with auto-imports disabled."
date: "2026-03-01"
tags: ["threejs", "tresjs", "nuxt", "debugging"]
---

# Getting TresJS Working with Nuxt 4

TresJS is a fantastic Vue 3 wrapper around Three.js. But plugging it into a Nuxt 4 project with some non-default config took some debugging. Here's what I ran into.

## Problem 1: `useRenderLoop` doesn't exist in TresJS 5

The docs for older versions reference `useRenderLoop`. In TresJS 5.x, the correct composable is `useLoop`, which exposes `onBeforeRender`.

```ts
const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  // runs every frame
})
```

## Problem 2: `useLoop` requires TresJS context

`useLoop` must be called inside a component that is rendered *inside* `<TresCanvas>`. If you call it in the same component that renders `<TresCanvas>`, it throws.

The fix: extract your scene objects into a child component.

```
ThreeBackground.vue          ← renders <TresCanvas>
  └─ ParticleSystem.vue      ← calls useLoop, renders scene objects
```

## Problem 3: SSR blows up

Three.js touches `window` and `document` during instantiation. Nuxt SSR will crash.

Wrap your canvas component in `<ClientOnly>`:

```vue
<ClientOnly>
  <ThreeBackground />
</ClientOnly>
```

## Problem 4: `TresBufferGeometry :attributes-position` format

The declarative `<TresBufferGeometry>` prop format is `[Float32Array, itemSize]`, not a raw `BufferAttribute` object. If you pass a `BufferAttribute` directly it silently does nothing.

For dynamic geometry that you mutate per-frame, creating the geometry imperatively and passing it as `:geometry="myGeometry"` to `<TresPoints>` is much less confusing.

## End Result

Once past these four issues, TresJS is a genuinely nice way to do 3D in Vue. The declarative scene graph maps naturally to component trees.
