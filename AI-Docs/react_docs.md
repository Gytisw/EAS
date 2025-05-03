# React Documentation: Core Concepts & Hooks

## Proper Hook Implementation Example
DESCRIPTION: Demonstrates a proper Hook implementation that uses other Hooks.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_6
LANGUAGE: javascript
```javascript
// ✅ Good: A Hook that uses other Hooks
function useAuth() {
  return useContext(Auth);
}
```

---

## Correct Usage of Hooks in React Components and Custom Hooks
DESCRIPTION: This snippet demonstrates the correct way to use Hooks at the top level of a function component and a custom Hook. It shows the usage of useState in both contexts.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/rules/rules-of-hooks.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
function Counter() {
  // ✅ Good: top-level in a function component
  const [count, setCount] = useState(0);
  // ...
}

function useWindowWidth() {
  // ✅ Good: top-level in a custom Hook
  const [width, setWidth] = useState(window.innerWidth);
  // ...
}
```

---

## Correct and Incorrect Hook Usage in React Functions
DESCRIPTION: This snippet shows the correct way to use Hooks in React function components and custom Hooks, as well as an incorrect usage in a regular JavaScript function.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/rules/rules-of-hooks.md#2025-04-22_snippet_2
LANGUAGE: javascript
```javascript
function FriendList() {
  const [onlineStatus, setOnlineStatus] = useOnlineStatus(); // ✅
}

function setOnlineStatus() { // ❌ Not a component or custom Hook!
  const [onlineStatus, setOnlineStatus] = useOnlineStatus();
}
```

---

## Hook Arguments Mutation
DESCRIPTION: Demonstrates proper handling of hook arguments with immutability patterns.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/rules/components-and-hooks-must-be-pure.md#2025-04-22_snippet_8
LANGUAGE: javascript
```javascript
function useIconStyle(icon) {
  const theme = useContext(ThemeContext);
  if (icon.enabled) {
    icon.className = computeStyle(icon, theme); // 🔴 Bad: never mutate hook arguments directly
  }
  return icon;
}
```
LANGUAGE: javascript
```javascript
function useIconStyle(icon) {
  const theme = useContext(ThemeContext);
  const newIcon = { ...icon }; // ✅ Good: make a copy instead
  if (icon.enabled) {
    newIcon.className = computeStyle(icon, theme);
  }
  return newIcon;
}
```

---

## Correct Usage of Hooks in React Components and Custom Hooks (Duplicate)
DESCRIPTION: Demonstrates the proper way to use hooks at the top level of function components and custom hooks.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/warnings/invalid-hook-call-warning.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
function Counter() {
  // ✅ Good: top-level in a function component
  const [count, setCount] = useState(0);
  // ...
}

function useWindowWidth() {
  // ✅ Good: top-level in a custom Hook
  const [width, setWidth] = useState(window.innerWidth);
  // ...
}
```

---

## Using Custom Hook for Chat Room Management
DESCRIPTION: This component snippet demonstrates the usage of a custom hook `useChatRoom` for connection management. The hook abstracts the useEffect logic, allowing the `ChatRoom` component to maintain focus on rendering and UI state management.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_16
LANGUAGE: JavaScript
```javascript
import { useState } from 'react';
import { useChatRoom } from './useChatRoom.js';

export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  });

  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}
```

---

## Comparing Hook vs Regular Function Implementation
DESCRIPTION: Demonstrates the difference between an incorrectly prefixed Hook and a proper regular function implementation for sorting items.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_4
LANGUAGE: javascript
```javascript
// 🔴 Avoid: A Hook that doesn't use Hooks
function useSorted(items) {
  return items.slice().sort();
}

// ✅ Good: A regular function that doesn't use Hooks
function getSorted(items) {
  return items.slice().sort();
}
```

---

## Ideal Approach: Using Purpose-Specific Custom Hooks
DESCRIPTION: The recommended pattern for using custom Hooks named after their specific purposes. This approach makes the component code more declarative and clearly communicates intent.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_27
LANGUAGE: javascript
```javascript
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  // ✅ Great: custom Hooks named after their purpose
  useChatRoom({ serverUrl, roomId });
  useImpressionLog('visit_chat', { roomId });
  // ...
}
```

---

## Future Hook Implementation
DESCRIPTION: Shows a Hook that's prepared for future Hook implementation.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_7
LANGUAGE: javascript
```javascript
// ✅ Good: A Hook that will likely use some other Hooks later
function useAuth() {
  // TODO: Replace with this line when authentication is implemented:
  // return useContext(Auth);
  return TEST_USER;
}
```

---

## Using useContext Hook in React
DESCRIPTION: Example of using the useContext Hook to access context values provided by a parent component. This snippet shows how to read a theme value from ThemeContext.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/hooks.md#2025-04-22_snippet_1
LANGUAGE: javascript
```javascript
function Button() {
  const theme = useContext(ThemeContext);
  // ...
```

---

## Complete useOnlineStatus Custom Hook with useDebugValue
DESCRIPTION: A complete implementation of a custom Hook that uses useDebugValue to provide a readable label in DevTools. The Hook tracks the online status of the browser.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useDebugValue.md#2025-04-22_snippet_2
LANGUAGE: javascript
```javascript
import { useSyncExternalStore, useDebugValue } from 'react';

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  useDebugValue(isOnline ? 'Online' : 'Offline');
  return isOnline;
}

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}
```

---

## Avoiding Higher Order Hooks in React
DESCRIPTION: Illustrates the incorrect practice of creating higher-order Hooks and the recommended approach of creating static versions of Hooks with desired functionality.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/rules/react-calls-components-and-hooks.md#2025-04-22_snippet_1
LANGUAGE: javascript
```javascript
function ChatInput() {
  const useDataWithLogging = withLogging(useData); // 🔴 Bad: don't write higher order Hooks
  const data = useDataWithLogging();
}
```
LANGUAGE: javascript
```javascript
function ChatInput() {
  const data = useDataWithLogging(); // ✅ Good: Create a new version of the Hook
}

function useDataWithLogging() {
  // ... Create a new version of the Hook and inline the logic here
}
```

---

## Styling Inputs and Buttons with CSS
DESCRIPTION: This CSS snippet defines basic styling for input elements and buttons. It provides spacing and positioning to enhance the form appearance in the chat application interface.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_15
LANGUAGE: CSS
```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

---

## Correct useMemo Implementation with Dependency Array
DESCRIPTION: The correct implementation of useMemo with a dependency array specified, ensuring the calculation only re-runs when the dependencies change.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useMemo.md#2025-04-22_snippet_37
LANGUAGE: javascript
```javascript
function TodoList({ todos, tab }) {
  // ✅ Does not recalculate unnecessarily
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  // ...
```

---

## Basic CSS Styling for Label and Theme (Duplicate)
DESCRIPTION: This CSS code is identical to the previous CSS snippet and provides basic styling for the label and theme classes (`.dark`, `.light`). It's included in the second Sandpack example as well.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useMemo.md#2025-04-22_snippet_13
LANGUAGE: css
```css
label {
  display: block;
  margin-top: 10px;
}

.dark {
  background-color: black;
  color: white;
}

.light {
  background-color: white;
  color: black;
}
```

---

## React JS Basic ViewTransition Enter/Exit Example
DESCRIPTION: This simple example demonstrates the core concept of triggering enter/exit animations. It shows a `Parent` component that conditionally renders a `Child` component. The `Child` component directly wraps its content ('Hi') with `<ViewTransition>`, illustrating the structure needed to activate the animation when added or removed.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/ViewTransition.md#_snippet_1
LANGUAGE: javascript
```javascript
function Child() {
  return <ViewTransition>Hi</ViewTransition>
}

function Parent() {
  const [show, setShow] = useState();
  if (show) {
    return <Child />;
  }
  return null;
}
```

---

## Proper Hook Usage in React Components
DESCRIPTION: Shows the correct way to use Hooks directly within components, rather than passing them as props or using them dynamically.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/rules/react-calls-components-and-hooks.md#2025-04-22_snippet_2
LANGUAGE: javascript
```javascript
function ChatInput() {
  return <Button useData={useDataWithLogging} /> // 🔴 Bad: don't pass Hooks as props
}
```
LANGUAGE: javascript
```javascript
function ChatInput() {
  return <Button />
}

function Button() {
  const data = useDataWithLogging(); // ✅ Good: Use the Hook directly
}

function useDataWithLogging() {
  // If there's any conditional logic to change the Hook's behavior, it should be inlined into
  // the Hook
}
```

---

## Basic useMemo Hook Usage
DESCRIPTION: Basic syntax example showing how to use the useMemo Hook in React
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useMemo.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
const cachedValue = useMemo(calculateValue, dependencies)
```

---

## Basic useSyncExternalStore Hook Usage
DESCRIPTION: Basic syntax example of using the useSyncExternalStore Hook to subscribe to an external store.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useSyncExternalStore.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

---

## Simplified useCallback Implementation
DESCRIPTION: Shows how useCallback could be implemented using useMemo, demonstrating that useCallback is essentially a specialized version of useMemo for functions.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useCallback.md#2025-04-22_snippet_8
LANGUAGE: javascript
```javascript
function useCallback(fn, dependencies) {
  return useMemo(() => fn, dependencies);
}
```

---

## Basic Usage of useContext Hook in React
DESCRIPTION: The simplest form of the useContext Hook, showing how to read a context value in a component.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useContext.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
const value = useContext(SomeContext)
```

---

## Basic useRef Hook Usage in React
DESCRIPTION: The basic syntax for using the useRef Hook to create a ref object with an initial value.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useRef.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
const ref = useRef(initialValue)
```

---

## Using useCallback for Function Memoization in React
DESCRIPTION: A more concise approach using useCallback instead of useMemo to memoize functions. This is functionally equivalent to the useMemo approach but avoids the need for nested functions.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useMemo.md#2025-04-22_snippet_29
LANGUAGE: javascript
```javascript
export default function Page({ productId, referrer }) {
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails
    });
  }, [productId, referrer]);

  return <Form onSubmit={handleSubmit} />;
}
```

---

## Custom Form Input Hook Implementation
DESCRIPTION: Implementation of a custom Hook for managing form input state and handlers.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_9
LANGUAGE: javascript
```javascript
import { useState } from 'react';

export function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function handleChange(e) {
    setValue(e.target.value);
  }

  const inputProps = {
    value: value,
    onChange: handleChange
  };

  return inputProps;
}
```

---

## Enhanced Online Status with useSyncExternalStore
DESCRIPTION: Improved implementation using useSyncExternalStore API to handle edge cases and server-side rendering. The hook provides better handling of initial states and network status synchronization.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_29
LANGUAGE: javascript
```javascript
import { useSyncExternalStore } from 'react';

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // How to get the value on the client
    () => true // How to get the value on the server
  );
}
```

---

## Basic useDeferredValue Hook Usage Syntax
DESCRIPTION: The basic syntax for using the useDeferredValue Hook in React, which returns a deferred version of the provided value.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useDeferredValue.md#2025-04-22_snippet_0
LANGUAGE: javascript
```javascript
const deferredValue = useDeferredValue(value)
```

---

## Advanced Animation Loop with useAnimationLoop Hook
DESCRIPTION: A more modular animation handling approach using the custom hooks useFadeIn and useAnimationLoop, separating concerns of animating frames specifically and managing the animation loop. Dependencies include React's useState, useEffect, and a useEffectEvent function for frame drawing.
SOURCE: https://github.com/reactjs/react.dev/blob/main/src/content/learn/reusing-logic-with-custom-hooks.md#2025-04-22_snippet_32
LANGUAGE: JavaScript
```javascript
import { useState, useEffect, useRef } from 'react';
import { useFadeIn } from './useFadeIn.js';

function Welcome() {
  const ref = useRef(null);

  useFadeIn(ref, 1000);

  return (
    <h1 className="welcome" ref={ref}>
      Welcome
    </h1>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome />}
    </>
  );
}
```
LANGUAGE: JavaScript
```javascript
import { useState, useEffect } from 'react';
import { experimental_useEffectEvent as useEffectEvent } from 'react';

export function useFadeIn(ref, duration) {
  const [isRunning, setIsRunning] = useState(true);

  useAnimationLoop(isRunning, (timePassed) => {
    const progress = Math.min(timePassed / duration, 1);
    ref.current.style.opacity = progress;
    if (progress === 1) {
      setIsRunning(false);
    }
  });
}

function useAnimationLoop(isRunning, drawFrame) {
  const onFrame = useEffectEvent(drawFrame);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const startTime = performance.now();
    let frameId = null;

    function tick(now) {
      const timePassed = now - startTime;
      onFrame(timePassed);
      frameId = requestAnimationFrame(tick);
    }

    tick();
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);
}