declare module "pg" {
  import { EventEmitter } from "node:events";

  export interface PoolConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    max?: number;
    idleTimeoutMillis?: number;
  }

  export class Pool extends EventEmitter {
    constructor(config?: PoolConfig);
    query(text: string, params?: any[]): Promise<{ rows: any[] }>;
    end(): Promise<void>;
  }
}
