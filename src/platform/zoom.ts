// Layout space and render size (ADR 0015). Scenes lay out in a 640×360 logical space; the canvas
// renders 1920×1080 (Full HD, the primary target) and each scene camera zooms ×3 onto that space.
export const BASE_WIDTH = 640;
export const BASE_HEIGHT = 360;
export const VIEW_ZOOM = 3;
export const RENDER_WIDTH = BASE_WIDTH * VIEW_ZOOM;
export const RENDER_HEIGHT = BASE_HEIGHT * VIEW_ZOOM;
