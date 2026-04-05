import { Response } from "express";

interface SSEClient {
    cnid: string;
    res: Response;
}

class SSEManager {
    private clients = new Map<string, SSEClient[]>();

    addClient(cnid: string, res: Response): void {
        const existing = this.clients.get(cnid) || [];
        existing.push({ cnid, res });
        this.clients.set(cnid, existing);
    }

    removeClient(cnid: string, res: Response): void {
        const existing = this.clients.get(cnid) || [];
        const filtered = existing.filter((client) => client.res !== res);
        if (filtered.length === 0) {
            this.clients.delete(cnid);
        } else {
            this.clients.set(cnid, filtered);
        }
    }

    sendToUser(cnid: string, event: string, data: unknown): void {
        const clients = this.clients.get(cnid) || [];
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const client of clients) {
            try {
                client.res.write(payload);
            } catch (error) {
                console.error("Failed to send SSE to client:", error);
            }
        }
    }

    broadcast(event: string, data: unknown): void {
        for (const [, clients] of this.clients) {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            for (const client of clients) {
                try {
                    client.res.write(payload);
                } catch (error) {
                    console.error("Failed to broadcast SSE:", error);
                }
            }
        }
    }

    getClientCount(): number {
        let count = 0;
        for (const clients of this.clients.values()) {
            count += clients.length;
        }
        return count;
    }
}

export const sseManager = new SSEManager();

export function setupSSEHeaders(): Record<string, string> {
    return {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
    };
}

export interface NewMailEvent {
    type: "new_mail";
    sender_name: string;
    sender_cnid: string;
    subject: string;
    thread_id: string;
    mail_id: string;
    sent_at: string;
}

export function emitNewMailEvent(
    recipientCnid: string,
    senderName: string,
    senderCnid: string,
    subject: string,
    threadId: string,
    mailId: string
): void {
    const event: NewMailEvent = {
        type: "new_mail",
        sender_name: senderName,
        sender_cnid: senderCnid,
        subject,
        thread_id: threadId,
        mail_id: mailId,
        sent_at: new Date().toISOString(),
    };
    sseManager.sendToUser(recipientCnid, "new_mail", event);
}
