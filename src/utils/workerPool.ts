/**
 * Worker Pool for executing tasks on background threads.
 */
class WorkerPool {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private taskQueue: Array<{
    toolId: string;
    inputBuffers: ArrayBuffer[];
    options: any;
    resolve: (val: any) => void;
    reject: (err: any) => void;
    taskId: string;
    onProgress?: (p: number) => void;
  }> = [];
  private maxWorkers: number = 2;
  private runningTasks = new Map<string, { 
    resolve: Function; 
    reject: Function;
    onProgress?: (p: number) => void;
  }>();

  constructor() {
    this.initPool();
  }

  private initPool() {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const { taskId, type, result, success, error, progress } = e.data;
      const task = this.runningTasks.get(taskId);
      if (task) {
        if (type === 'progress') {
          task.onProgress?.(progress);
          return;
        }
        if (success) task.resolve(result);
        else task.reject(new Error(error));
        this.runningTasks.delete(taskId);
      }
      this.idleWorkers.push(worker);
      this.processQueue();
    };
    this.workers.push(worker);
    this.idleWorkers.push(worker);
  }

  resize(newSize: number) {
    if (newSize > this.maxWorkers) {
      for (let i = 0; i < newSize - this.maxWorkers; i++) {
        this.createWorker();
      }
    } else if (newSize < this.maxWorkers) {
      // Simple strategy: remove idle workers or wait for them
      const toRemove = this.maxWorkers - newSize;
      let removed = 0;
      while (removed < toRemove && this.idleWorkers.length > 0) {
        const worker = this.idleWorkers.pop()!;
        worker.terminate();
        this.workers = this.workers.filter(w => w !== worker);
        removed++;
      }
    }
    this.maxWorkers = newSize;
    this.processQueue();
  }

  async run(
    toolId: string, 
    inputBuffers: ArrayBuffer[], 
    options: any, 
    onProgress?: (p: number) => void
  ): Promise<Uint8Array | Uint8Array[]> {
    const taskId = Math.random().toString(36).substring(7);
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ toolId, inputBuffers, options, resolve, reject, taskId, onProgress });
      this.processQueue();
    });
  }

  private processQueue() {
    while (this.taskQueue.length > 0 && this.idleWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.idleWorkers.pop()!;
      
      this.runningTasks.set(task.taskId, { 
        resolve: task.resolve, 
        reject: task.reject, 
        onProgress: task.onProgress 
      });
      
      // Use Transferable Objects
      worker.postMessage({
        toolId: task.toolId,
        inputBuffers: task.inputBuffers,
        options: task.options,
        taskId: task.taskId
      }, task.inputBuffers);
    }
  }
}

export const workerPool = new WorkerPool();
