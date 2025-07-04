

interface QueueItem {
    id: string;
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }
  
  class APIQueueManager {
    private queue: QueueItem[] = [];
    private isProcessing: boolean = false;
    private minDelayBetweenCalls: number = 2000; // 2 segundos entre calls
    private lastCallTime: number = 0;
  
    /**
     * Añade una llamada a la API a la cola
     */
    public async enqueue<T>(apiCall: () => Promise<T>, callId?: string): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const queueItem: QueueItem = {
          id: callId || `api-call-${Date.now()}-${Math.random()}`,
          execute: apiCall,
          resolve,
          reject,
          timestamp: Date.now(),
        };
  
        this.queue.push(queueItem);
        console.log(`📥 API call queued: ${queueItem.id} (Queue length: ${this.queue.length})`);
        
        // Procesar la cola si no está procesando
        if (!this.isProcessing) {
          this.processQueue();
        }
      });
    }
  
    /**
     * Procesa la cola de manera secuencial
     */
    private async processQueue(): Promise<void> {
      if (this.isProcessing || this.queue.length === 0) {
        return;
      }
  
      this.isProcessing = true;
      console.log(`🔄 Starting queue processing. Queue length: ${this.queue.length}`);
  
      while (this.queue.length > 0) {
        const item = this.queue.shift()!;
        
        try {
          // Esperar el delay mínimo desde la última llamada
          const timeSinceLastCall = Date.now() - this.lastCallTime;
          if (timeSinceLastCall < this.minDelayBetweenCalls) {
            const waitTime = this.minDelayBetweenCalls - timeSinceLastCall;
            console.log(`⏳ Waiting ${waitTime}ms before next API call (${item.id})`);
            await this.sleep(waitTime);
          }
  
          console.log(`🚀 Executing API call: ${item.id}`);
          const result = await item.execute();
          
          this.lastCallTime = Date.now();
          item.resolve(result);
          console.log(`✅ API call completed: ${item.id}`);
  
        } catch (error) {
          console.error(`❌ API call failed: ${item.id}`, error);
          item.reject(error);
        }
  
        // Pequeña pausa adicional entre procesamiento de items
        await this.sleep(100);
      }
  
      this.isProcessing = false;
      console.log(`✅ Queue processing completed`);
    }
  
    /**
     * Obtiene el estado actual de la cola
     */
    public getQueueStatus() {
      return {
        queueLength: this.queue.length,
        isProcessing: this.isProcessing,
        nextCallIn: Math.max(0, this.minDelayBetweenCalls - (Date.now() - this.lastCallTime)),
      };
    }
  
    /**
     * Limpia la cola (cancela todas las llamadas pendientes)
     */
    public clearQueue() {
      const canceledCount = this.queue.length;
      
      // Rechazar todas las llamadas pendientes
      this.queue.forEach(item => {
        item.reject(new Error('API call canceled - queue cleared'));
      });
      
      this.queue = [];
      console.log(`🗑️ Queue cleared. ${canceledCount} calls canceled.`);
    }
  
    /**
     * Configura el delay mínimo entre llamadas
     */
    public setMinDelay(ms: number) {
      this.minDelayBetweenCalls = ms;
      console.log(`⚙️ Min delay between API calls set to ${ms}ms`);
    }
  
    private sleep(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  // Singleton instance
  export const apiQueueManager = new APIQueueManager();
  
  // Helper function para usar fácilmente
  export const queueAPICall = <T>(apiCall: () => Promise<T>, callId?: string): Promise<T> => {
    return apiQueueManager.enqueue(apiCall, callId);
  };