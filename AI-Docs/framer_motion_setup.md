# Framer Motion Setup & Basic Usage (v12.9.4)

This document summarizes key information for integrating and using Framer Motion in the EAS React project, based on snippets retrieved via Context7 from the `/motiondivision/motion` repository.

## Installation

Install the library using npm:

```bash
npm install framer-motion@12.9.4 # Pinning to specific version from TECH_STACK.md
```

## Core Concept: The `motion` Component

Framer Motion provides special `motion` components that extend standard HTML and SVG elements with animation capabilities.

### Importing

Import the `motion` component into your React components:

```jsx
import { motion } from "framer-motion";
```

### Basic Usage

Use `motion` components like regular HTML elements, but add animation props like `animate`.

**Example: Animating X position**

```jsx
import { motion } from "framer-motion";

function MyComponent() {
  // Animates the div 100px to the right
  return <motion.div animate={{ x: 100 }} />;
}
```

**Example: Animating Opacity based on state**

```jsx
import { motion } from "framer-motion";

export function MyConditionalComponent({ isVisible }) {
  // Animates opacity between 0 and 1 based on the isVisible prop
  return <motion.div animate={{ opacity: isVisible ? 1 : 0 }} />;
}
```

## Further Exploration Needed

The retrieved snippets primarily cover basic installation and the fundamental `motion` component usage for simple, direct animations.

Key concepts requested in `PROJECT_PLAN.md` that were **not explicitly covered** in these specific snippets include:

*   **Variants:** Pre-defined animation states that can be orchestrated.
*   **Transitions:** Customizing the *how* of an animation (duration, ease, delay, type like spring or tween).
*   **Detailed Animation Principles:** Deeper explanations beyond basic property animation.

**Recommendation:** Refer to the official Framer Motion documentation website for comprehensive guides on variants, transitions, gestures, layout animations, and other core concepts relevant to achieving the desired highly animated UI for the EAS project.

*   **Official Docs:** [https://www.framer.com/motion/](https://www.framer.com/motion/)