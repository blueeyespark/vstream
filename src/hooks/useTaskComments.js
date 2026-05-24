import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useTaskComments({ taskId }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!taskId) return;
    const unsubscribe = base44.entities.TaskComment.subscribe((event) => {
      if (event.data?.task_id === taskId) {
        queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      }
    });
    return unsubscribe;
  }, [taskId, queryClient]);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => base44.entities.TaskComment.filter({ task_id: taskId }, "created_date"),
    enabled: !!taskId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskComment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.TaskComment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] }),
  });

  return {
    comments,
    isLoading,
    addCommentMutation,
    deleteCommentMutation,
  };
}

export default useTaskComments;
