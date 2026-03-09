import { ref } from "vue";
import { useGamepad, useRafFn } from "@vueuse/core";

/**
 * Polls the first connected gamepad each frame and fires callbacks on the
 * leading edge of button presses (not on hold). Also supports left-stick Y
 * for up/down navigation with a short cooldown between repeats.
 *
 * Standard button layout (Xbox / PS):
 *   0 = A / Cross   → confirm
 *   1 = B / Circle  → back
 *  12 = D-pad up    → up
 *  13 = D-pad down  → down
 *
 * Axes:
 *   1 = Left stick Y  (< -0.5 → up, > 0.5 → down)
 */
export function useGamepadNav({
  onUp,
  onDown,
  onConfirm,
  onBack,
}: {
  onUp?: () => void;
  onDown?: () => void;
  onConfirm?: () => void;
  onBack?: () => void;
} = {}) {
  const { gamepads } = useGamepad();

  // Per-button previous-pressed state for edge detection
  const prevButtons = ref<boolean[]>([]);
  // Cooldown (frames) before the stick can fire again
  let stickCooldown = 0;

  useRafFn(() => {
    const gp = gamepads.value[0];
    if (!gp) return;

    const curr = Array.from(gp.buttons).map((b) => b.pressed);
    const prev = prevButtons.value;

    // Returns true only on the first frame the button is held
    const justPressed = (i: number): boolean => (curr[i] ?? false) && !(prev[i] ?? false);

    if (justPressed(12)) onUp?.();
    if (justPressed(13)) onDown?.();
    if (justPressed(0)) onConfirm?.();
    if (justPressed(1)) onBack?.();

    // Left-stick Y axis — fires with a per-repeat cooldown so the menu
    // scrolls at a comfortable pace when the stick is held
    const stickY = (gp.axes[1] ?? 0) as number;
    if (stickCooldown > 0) {
      stickCooldown--;
    } else if (stickY < -0.5) {
      onUp?.();
      stickCooldown = 18;
    } else if (stickY > 0.5) {
      onDown?.();
      stickCooldown = 18;
    } else {
      // Reset cooldown once stick returns to centre so next flick is instant
      stickCooldown = 0;
    }

    prevButtons.value = curr;
  });
}
