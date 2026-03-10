import { ref } from "vue";
import { useGamepad, useRafFn } from "@vueuse/core";

/**
 * Polls the first connected gamepad each frame and fires callbacks on the
 * leading edge of button presses (not on hold). Also supports left-stick X/Y
 * for directional navigation with a short cooldown between repeats.
 *
 * Standard button layout (Xbox / PS):
 *   0 = A / Cross    → confirm
 *   1 = B / Circle   → back
 *  12 = D-pad up     → up
 *  13 = D-pad down   → down
 *  14 = D-pad left   → left
 *  15 = D-pad right  → right
 *
 * Axes:
 *   0 = Left stick X  (< -0.5 → left, > 0.5 → right)
 *   1 = Left stick Y  (< -0.5 → up,   > 0.5 → down)
 */
export function useGamepadNav({
  onUp,
  onDown,
  onLeft,
  onRight,
  onConfirm,
  onBack,
}: {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onConfirm?: () => void;
  onBack?: () => void;
} = {}) {
  const { gamepads } = useGamepad();

  // Per-button previous-pressed state for edge detection
  const prevButtons = ref<boolean[]>([]);
  // Cooldown (frames) before each stick axis can fire again
  let stickYCooldown = 0;
  let stickXCooldown = 0;

  useRafFn(() => {
    const gp = gamepads.value[0];
    if (!gp) return;

    const curr = Array.from(gp.buttons).map((b) => b.pressed);
    const prev = prevButtons.value;

    // Returns true only on the first frame the button is held
    const justPressed = (i: number): boolean => (curr[i] ?? false) && !(prev[i] ?? false);

    if (justPressed(12)) onUp?.();
    if (justPressed(13)) onDown?.();
    if (justPressed(14)) onLeft?.();
    if (justPressed(15)) onRight?.();
    if (justPressed(0)) onConfirm?.();
    if (justPressed(1)) onBack?.();

    // Left-stick Y axis — fires with a per-repeat cooldown so navigation
    // scrolls at a comfortable pace when the stick is held
    const stickY = (gp.axes[1] ?? 0) as number;
    if (stickYCooldown > 0) {
      stickYCooldown--;
    } else if (stickY < -0.5) {
      onUp?.();
      stickYCooldown = 18;
    } else if (stickY > 0.5) {
      onDown?.();
      stickYCooldown = 18;
    } else {
      stickYCooldown = 0;
    }

    // Left-stick X axis
    const stickX = (gp.axes[0] ?? 0) as number;
    if (stickXCooldown > 0) {
      stickXCooldown--;
    } else if (stickX < -0.5) {
      onLeft?.();
      stickXCooldown = 18;
    } else if (stickX > 0.5) {
      onRight?.();
      stickXCooldown = 18;
    } else {
      stickXCooldown = 0;
    }

    prevButtons.value = curr;
  });
}
