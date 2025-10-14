# AI Claims Portal - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Utility-Focused Application)  
**System:** Material Design principles with clean, minimal execution  
**Justification:** This is a workflow tool requiring efficiency, clarity, and professional polish. Focus on usability over visual flair.

## Core Layout Structure

### Split-Layout System
- **Left Sidebar:** Fixed 1/3 width (w-1/3), labeled "Status"
  - Real-time progress updates
  - Workflow step indicators
  - Status badges and timestamps
  - Sticky positioning for visibility during scroll
  
- **Main Panel:** 2/3 width (w-2/3)
  - Portal title "AI Claims Portal" (large, bold heading)
  - Prominent "New Request" button (primary CTA)
  - Subsequent workflow steps appear here dynamically
  - Form inputs and document upload areas

### Responsive Behavior
- Desktop (lg:): Maintain split layout
- Tablet/Mobile: Stack to single column, sidebar becomes collapsible or top banner

## Color Palette

**Dark Mode Primary (User Requirement: Consistent dark mode)**
- Background: 220 15% 12% (deep slate)
- Surface: 220 15% 18% (elevated panels)
- Text Primary: 0 0% 95% (high contrast white)
- Text Secondary: 0 0% 70% (muted gray)

**Accent Colors**
- Primary Action: 210 100% 60% (bright blue - for New Request button)
- Success: 142 76% 45% (green - completed statuses)
- Warning: 38 92% 50% (amber - pending states)
- Error: 0 72% 51% (red - issues/rejections)

## Typography

**Font Stack:** Inter or System UI for maximum legibility
- **Portal Title:** text-4xl font-bold (36px, 700 weight)
- **Section Headers:** text-xl font-semibold (20px, 600 weight)
- **Body Text:** text-base font-normal (16px, 400 weight)
- **Status Labels:** text-sm font-medium uppercase tracking-wide (14px, 500 weight)

## Spacing System

**Tailwind Units:** Consistent use of 4, 6, 8, 12, 16 for predictable rhythm
- Component padding: p-6 to p-8
- Section spacing: space-y-6 between elements
- Container margins: mx-auto max-w-7xl px-8
- Button padding: px-6 py-3 for primary CTAs

## Component Library

### Primary CTA Button ("New Request")
- Large, prominent button: px-8 py-4 text-lg
- Blue background (210 100% 60%)
- Rounded corners: rounded-lg
- Subtle shadow: shadow-lg
- Hover: Slight brightness increase, shadow-xl

### Status Sidebar Components
- **Progress Indicators:** Vertical timeline with connecting lines
- **Status Badges:** Rounded pills with color-coded backgrounds
  - Pending: Amber background
  - Processing: Blue background with pulse animation
  - Completed: Green background with checkmark icon
- **Timestamp Display:** Small, muted text below each status

### Form Elements (for workflow steps)
- Input fields: Dark background with subtle border, high contrast text
- File upload: Dashed border dropzone, drag-and-drop enabled
- Submit buttons: Secondary style (outline), less prominent than primary CTA

### Cards/Panels
- Background: Surface color (220 15% 18%)
- Border: Subtle 1px border with 220 15% 25%
- Rounded: rounded-xl
- Shadow: shadow-md for depth

## Layout Specifications

### Main Panel Content Flow
1. **Header Section:** Portal title + tagline (if needed)
2. **Primary CTA:** "New Request" button, center or left-aligned, generous margin-bottom
3. **Dynamic Content Area:** Forms, upload zones, or success messages appear here
4. **Footer/Help:** Subtle links or support information at bottom

### Status Sidebar Content
1. **Sidebar Header:** "Status" label, sticky at top
2. **Active Workflow:** Current claim being processed (if any)
3. **Recent History:** List of past 3-5 claims with mini status indicators
4. **Legend:** Color-coded status explanation at bottom

## Interaction Patterns

### Workflow Progression
- Clicking "New Request" reveals form in main panel
- Status sidebar updates in real-time as backend processes
- Smooth transitions between workflow steps (fade in/out)
- Loading states: Skeleton screens or spinners with progress text

### Visual Feedback
- Button states: Clear hover, active, disabled styles
- Form validation: Inline error messages in red
- Success confirmations: Green checkmark icons with brief message
- File upload: Progress bar during transmission

## Animations

**Minimal, purposeful only:**
- Status badge pulse for "Processing" state
- Smooth fade transitions between workflow steps (300ms)
- Button hover/active micro-interactions (built-in)
- **No:** Scroll animations, parallax, or decorative effects

## Images

**No Hero Images Required**  
This is a utility application - visual hierarchy comes from typography and layout, not photography.

**Icons Only:**
- Use Heroicons (outline style) via CDN
- Status icons: CheckCircle, Clock, XCircle
- Action icons: PlusCircle (New Request), DocumentArrowUp (Upload)
- Small, 20-24px size, inline with text

## Accessibility Notes

- Maintain high contrast ratios (WCAG AAA)
- All form inputs with visible labels
- Focus states clearly visible with blue outline
- Status updates also conveyed via text, not just color
- Keyboard navigation fully supported