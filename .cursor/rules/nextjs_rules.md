# Next.js Rules
- **Description**: Applies to Next.js pages, components, and API routes.
- **File Pattern**: **/pages/**/*.js, **/components/ui/**/*.js, **/api/**/*.js
- **Rule**: Use Next.js API routes only for initial room creation and terrain selection, not real-time game logic.
- **Rule**: Leverage React Context or Zustand for state management of room details (e.g., player list, selected terrain).
- **Rule**: Keep UI components lightweight—avoid embedding Three.js logic directly in Next.js pages; delegate to custom hooks or libs.