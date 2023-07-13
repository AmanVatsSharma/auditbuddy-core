import { WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'url';

interface AuditProgress {
  id: string;
  status: string;
  progress: number;
  currentStep: string;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const { query } = parse(req.url || '', true);
      const auditId = query.auditId as string;

      if (!auditId) {
        ws.close();
        return;
      }

      this.addClient(auditId, ws);

      ws.on('close', () => {
        this.removeClient(auditId, ws);
      });
    });
  }

  private addClient(auditId: string, ws: WebSocket) {
    if (!this.clients.has(auditId)) {
      this.clients.set(auditId, new Set());
    }
    this.clients.get(auditId)?.add(ws);
  }

  private removeClient(auditId: string, ws: WebSocket) {
    this.clients.get(auditId)?.delete(ws);
    if (this.clients.get(auditId)?.size === 0) {
      this.clients.delete(auditId);
    }
  }

  public broadcastProgress(auditId: string, progress: AuditProgress) {
    this.clients.get(auditId)?.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(progress));
      }
    });
  }
} 