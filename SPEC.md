# OTP Verification Input Component

## Concept & Vision
A sleek, modern OTP verification experience that feels responsive and secure. The component should communicate trust through subtle animations and clear feedback, making the mundane task of entering a code feel premium and effortless.

## Design Language

### Aesthetic Direction
Inspired by fintech apps like Revolut and N26 — minimal, focused, with micro-interactions that feel tactile and responsive.

### Color Palette
- **Primary**: `#6366F1` (Indigo-500) — Trust, security
- **Primary Dark**: `#4F46E5` (Indigo-600) — Hover states
- **Success**: `#10B981` (Emerald-500) — Verified state
- **Error**: `#EF4444` (Red-500) — Error states
- **Background**: `#0F172A` (Slate-900) — Dark, focused
- **Surface**: `#1E293B` (Slate-800) — Card background
- **Text Primary**: `#F8FAFC` (Slate-50)
- **Text Secondary**: `#94A3B8` (Slate-400)
- **Border Default**: `#334155` (Slate-700)
- **Border Focus**: `#6366F1` (Indigo-500)

### Typography
- **Font**: Inter (Google Fonts) with system fallbacks
- **OTP Digits**: 2rem, bold, monospace appearance
- **Labels**: 0.875rem, medium weight
- **Timer text**: 0.75rem

### Spatial System
- OTP box: 56px × 64px with 12px gaps
- Card padding: 2rem
- Border radius: 12px (card), 8px (inputs)
- Vertical rhythm: 1.5rem between sections

### Motion Philosophy
- **Auto-advance**: Instant focus, no delay
- **Shake error**: 400ms, 3 oscillations, elastic easing
- **Success checkmark**: Scale + fade, 300ms
- **Resend pulse**: Gentle glow pulse when available
- **Countdown**: Smooth number transition

## Layout & Structure

### Page Structure
- Centered card on dark gradient background
- Subtle radial gradient spotlight effect
- Card contains: title, subtitle, OTP inputs, timer, resend button, submit button

### Visual Hierarchy
1. OTP inputs (primary focus)
2. Submit button (clear CTA)
3. Timer/Resend (secondary, below)

### Responsive Strategy
- Mobile-first, inputs scale down slightly on small screens
- Full-width button on mobile

## Features & Interactions

### Core Features

**1. OTP Input Boxes**
- 6 individual input boxes (configurable)
- Accepts only digits
- Auto-advances to next box on input
- Backspace moves to previous box and clears current
- Arrow keys navigate between boxes
- Click/tap focuses specific box

**2. Paste Support**
- Paste anywhere focuses first empty box
- Distributes pasted digits across boxes left-to-right
- If paste completes all boxes, auto-submits
- Visual feedback on paste (brief highlight)

**3. Error Shake Animation**
- Triggered on invalid submission
- Horizontal oscillation: translateX(-10px, 10px, -10px, 10px, 0)
- Border color flashes error red
- 400ms duration with ease-out

**4. Countdown Timer**
- 60-second countdown after send
- Displays as "Resend in 0:45" format
- Smooth decrement animation
- When reaches 0, shows "Resend Code"

**5. Resend Animation**
- Button pulses with glow when timer expires
- Gentle scale animation (1.0 → 1.02 → 1.0)
- Box-shadow pulse effect

### States

**Input States**
- Default: Slate border, dark background
- Focus: Indigo border, subtle glow
- Filled: Slightly brighter background
- Error: Red border, shake animation
- Success: Green border, checkmark overlay

**Button States**
- Default: Indigo background
- Hover: Darker indigo, slight lift
- Loading: Spinner, disabled
- Disabled: Reduced opacity, no pointer

### Edge Cases
- Pasting non-digits: Strip non-numeric characters
- Pasting more than 6 digits: Take first 6
- Empty submission: Shake, show error message
- Wrong code: Shake, clear inputs, refocus first

## Component Inventory

### OTPInput
- 6 individual digit inputs in a row
- Each input: 56×64px, centered text, rounded corners
- Focus ring animation on the focused input
- Paste handler on the container

### TimerDisplay
- Shows countdown when active
- Transitions to resend button when complete
- MM:SS format

### ResendButton
- Initially hidden (timer active)
- Appears with pulse animation when available
- Hover: Background lighten

### SubmitButton
- Full-width, prominent
- Shows loading spinner during verification
- Disabled until all boxes filled

### ErrorMessage
- Appears below inputs on error
- Red text, fade-in animation
- Auto-dismisses on input change

## Technical Approach

### Framework
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations (or CSS animations)

### State Management
- Local component state with useState
- States: digits[], focusedIndex, error, isLoading, timeLeft, isComplete

### Key Implementation Details
- refs array for each input for focus management
- useEffect for timer countdown
- onPaste handler on container div
- CSS keyframes for shake animation
- Conditional class application for states
