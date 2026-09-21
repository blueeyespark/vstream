import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { data } from "@/platform/entities";

export function useTaskComments({ taskId }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!taskId) return;
    const unsubscribe = data.TaskComment.subscribe((event) => {
      if (event.data?.task_id === taskId) {
        queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      }
    });
    return unsubscribe;
  }, [taskId, queryClient]);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => data.TaskComment.filter({ task_id: taskId }, "created_date"),
    enabled: !!taskId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => data.TaskComment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => data.TaskComment.delete(id),
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
