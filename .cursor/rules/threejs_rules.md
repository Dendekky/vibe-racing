# Three.js Rendering Rules
- **Description**: Applies to files using Three.js for 3D rendering.
- **File Pattern**: **/components/game/**/*.js, **/lib/render/**/*.js
- **Rule**: Optimize 3D models—keep polygon counts below 10k per car and use LOD (Level of Detail) for distant objects.
- **Rule**: Separate rendering logic (Three.js) from physics (Cannon.js) into distinct modules, syncing them via a main game loop.
- **Rule**: Use React hooks (e.g., useRef, useEffect) to manage Three.js scenes and prevent memory leaks.
- **Reference File**: Include /lib/render/terrain.js for terrain selection logic.