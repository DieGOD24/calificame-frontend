import { useState, useEffect, useCallback, useRef } from 'react';
import { getTask } from '@/lib/api';
import { TaskLog } from '@/types/task';

export function useTaskPolling(taskId: string | null, intervalMs = 2000) {
  const [task, setTask] = useState<TaskLog | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    if (!taskId) return;
    setIsPolling(true);
  }, [taskId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isPolling || !taskId) return;

    const poll = async () => {
      try {
        const res = await getTask(taskId);
        setTask(res.data);
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    };

    poll(); // immediate first poll
    intervalRef.current = setInterval(poll, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPolling, taskId, intervalMs, stopPolling]);

  return { task, isPolling, startPolling, stopPolling };
}
