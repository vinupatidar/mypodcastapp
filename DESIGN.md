# Design System Specification: Editorial Precision & Atmospheric Depth

## 1. Overview & Creative North Star: "The Digital Atoll"
This design system rejects the "boxed-in" nature of traditional web grids in favor of a fluid, atmospheric experience inspired by premium iOS aesthetics. Our Creative North Star is **"The Digital Atoll"**—a concept where content "islands" of crisp white and electric blue float within a deep, vast sea of professional navy.

We move beyond the template look by using **intentional asymmetry**. Do not center-align every hero; allow typography to anchor the left while visual elements bleed off the right. We replace rigid 1px dividers with **tonal transitions** and **layered glassmorphism**, creating a UI that feels like a physical stack of semi-translucent materials rather than a flat digital plane.

---

## 2. Color Strategy & The "Invisible" UI
Our palette is a sophisticated gradient of professional trust and innovative energy.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders (`#outline`) for sectioning content. To define boundaries, use background color shifts. 
*   *Example:* A `surface-container-low` (#f4f3f8) card sitting on a `surface` (#faf9fe) background provides enough contrast to be felt, but not seen as a "line."

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
1.  **Base Layer:** `surface` (#faf9fe) - Use for the main background.
2.  **Sectioning:** `surface-container` (#eeedf3) - Use for large structural blocks.
3.  **Content Cards:** `surface-container-lowest` (#ffffff) - Use to make content "pop" forward.
4.  **Interaction Layers:** `surface-container-high` (#e9e7ed) - Use for hover states or active toggles.

### The "Glass & Gradient" Rule
To capture the "Electric Blue" innovation, use linear gradients for primary CTAs: 
*   **Signature Gradient:** From `primary` (#0058bc) to `primary-container` (#0070eb) at a 135° angle.
*   **Glassmorphism:** For floating navigation or modals, use `surface` at 70% opacity with a `20px` backdrop-blur. This allows the underlying `primary` or `secondary` tones to bleed through, softening the interface.

---

## 3. Typography: Editorial Authority
We utilize a San Francisco-inspired scale (Inter) to convey a balance of professional tech and high-end editorial.

*   **Display (lg/md/sm):** Reserved for high-impact brand moments. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create an authoritative, "Apple-esque" headline.
*   **Headline & Title:** Use `headline-md` (1.75rem) for section headers. Ensure a generous `16` (4rem) spacing block above headlines to let the typography breathe.
*   **Body (lg/md/sm):** `body-lg` (1rem) is the workhorse. Always use `on-surface-variant` (#414755) for long-form body text to reduce eye strain and maintain a premium, softened contrast.
*   **Labels:** Use `label-md` (0.75rem) in ALL CAPS with +0.05em tracking for overlines to signal categorization without adding visual weight.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too "muddy." We achieve depth through light and material properties.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` object on a `surface-container-low` background. This creates a "Natural Lift."
*   **Ambient Shadows:** If a floating element (like a FAB or Modal) requires a shadow, use a blur of `32px` at 6% opacity. The shadow color must be a tint of our primary: `rgba(0, 88, 188, 0.08)`. Never use pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#c1c6d7) at **15% opacity**. It should be a whisper, not a shout.
*   **Corner Radii:** Strictly adhere to the scale. Use `xl` (1.5rem) for main containers and `md` (0.75rem) for internal components like buttons and inputs to mimic the "squircle" feel of iOS.

---

## 5. Components & Primitive Styling

### Buttons (The Interaction Pillars)
*   **Primary:** Signature Gradient (`primary` to `primary-container`), white text, `full` roundedness. 
*   **Secondary:** `secondary-container` (#9fc2fe) background with `on-secondary-container` (#294f83) text. No border.
*   **Tertiary:** Ghost style. No background, `primary` text. Use for low-priority actions.

### Cards & Lists (The "No-Divider" Rule)
*   **Cards:** Use `surface-container-lowest` with a `lg` (1rem) corner radius. Use `spacing-6` (1.5rem) padding.
*   **Lists:** **Forbidden:** 1px dividers between list items. Instead, use a `2px` vertical gap (`spacing-0.5`) and a subtle background shift (`surface-container-low`) on hover to define the list item area.

### Input Fields
*   **Text Inputs:** Background `surface-container-highest` (#e3e2e7). No border. On focus, transition the background to `surface-lowest` and add a `2px` `primary` "Ghost Border" (20% opacity).

### Signature Component: The "Glass Header"
A persistent top navigation using `surface` at 80% opacity with a heavy backdrop-blur. This maintains the "Professional & Innovative" personality by keeping the user grounded in the app's depth.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use white space as a structural element. If in doubt, increase the spacing to the next tier in the scale (e.g., from `8` to `10`).
*   **Do** use `primary-fixed-dim` (#adc6ff) for subtle highlights in dark-mode or high-intensity blue sections.
*   **Do** ensure all interactive elements have a minimum touch target of 44x44pt, following iOS best practices.

### Don’t:
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#1a1b1f) to maintain the "Deep Blue" tonal range.
*   **Don't** use standard "Drop Shadows" from software defaults. Use the Ambient Shadow formula specified in Section 4.
*   **Don't** use 100% opaque borders to separate content. Let the colors do the work.