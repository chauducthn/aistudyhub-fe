/**
 * SWP391 UI — Figma file context for MCP tools (get_design_context, get_screenshot).
 * @see https://www.figma.com/design/5ovQZG71O7DI3viL9nLX3v/SWP391-UI-DESIGN
 */
export const FIGMA_FILE_KEY = '5ovQZG71O7DI3viL9nLX3v'

export const FIGMA_NODES = {
  /** Frame from user link (node-id=2-830) */
  primary: '2:830',
  /** Login / Register split layout */
  auth: '96:741',
}

export const FIGMA_FILE_URL =
  'https://www.figma.com/design/5ovQZG71O7DI3viL9nLX3v/SWP391-UI-DESIGN'

export function figmaNodeUrl(nodeId) {
  const param = nodeId.replace(':', '-')
  return `${FIGMA_FILE_URL}?node-id=${param}`
}
