export { createApi } from './services/api';
export { initSocket, getSocket, disconnectSocket } from './services/socketService';

// NOTE: design tokens are deliberately NOT re-exported here. This barrel pulls
// in the service layer (axios, async-storage, socket.io), so importing it just
// to read a color would drag the whole network stack into the bundle — and
// breaks under Jest, which resolves shared-mobile's own node_modules.
// Import tokens directly instead:
//   import { Brand } from 'shared-mobile/src/theme/brand';
