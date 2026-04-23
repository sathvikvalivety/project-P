import { TOOL_REGISTRY } from '../tools/registry';

self.onmessage = async (e: MessageEvent) => {
  const { toolId, inputBuffers, options, taskId } = e.data;

  try {
    const tool = TOOL_REGISTRY.find(t => t.id === toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);

    // Reconstruct Files from buffers if needed, or just pass buffers
    // Most tools expect File[] but we can pass mock Files or modify tools to take buffers
    // For now, let's assume tools take File[]
    const files = inputBuffers.map((buf: ArrayBuffer, i: number) => {
      return new File([buf], `input_${i}`, { type: 'application/octet-stream' });
    });

    const execute = await tool.load();
    const result = await execute(files, options, (p) => {
      self.postMessage({ taskId, type: 'progress', progress: p });
    });

    if (Array.isArray(result)) {
      const buffers = result.map(r => r.buffer);
      self.postMessage({ taskId, type: 'result', result: buffers, success: true }, buffers);
    } else {
      self.postMessage({ taskId, type: 'result', result: result.buffer, success: true }, [result.buffer]);
    }
  } catch (error: any) {
    self.postMessage({ taskId, error: error.message, success: false });
  }
};
