"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";
import { MessageSquare, Send, Lock, RefreshCw } from "lucide-react";
import type { TicketComment } from "@/types";

interface TicketCommentsProps {
  ticketId: string;
  ticketCreatedBy: string;
}

export function TicketComments({ ticketId, ticketCreatedBy }: TicketCommentsProps) {
  const { profile, isManager, isSuperAdmin } = useCurrentUser();
  const { data, isLoading } = useComments(ticketId);
  const createComment = useCreateComment();

  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const comments: TicketComment[] = data?.data || [];
  const canCreateInternal = isManager || isSuperAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createComment.mutateAsync({
      ticketId,
      data: {
        content: content.trim(),
        is_internal: isInternal,
      },
    });

    setContent("");
    setIsInternal(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          {comments.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={createComment.isPending}
          />

          <div className="flex items-center justify-between">
            {canCreateInternal && (
              <Button
                type="button"
                variant={isInternal ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsInternal(!isInternal)}
                className="gap-1"
              >
                <Lock className="h-3 w-3" />
                Internal Note
              </Button>
            )}
            {!canCreateInternal && <div />}

            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || createComment.isPending}
              className="gap-1"
            >
              {createComment.isPending ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  Post Comment
                </>
              )}
            </Button>
          </div>

          {isInternal && (
            <p className="text-xs text-muted-foreground">
              🔒 This comment will only be visible to managers and admins.
            </p>
          )}
        </form>

        <Separator />

        {/* Comments list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment on this ticket.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwnComment={comment.user_id === profile?.id}
                isTicketCreator={comment.user_id === ticketCreatedBy}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CommentItemProps {
  comment: TicketComment;
  isOwnComment: boolean;
  isTicketCreator: boolean;
}

function CommentItem({ comment, isOwnComment, isTicketCreator }: CommentItemProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={`flex gap-3 ${
        comment.is_internal ? "bg-amber-500/5 -mx-4 px-4 py-3 rounded-lg border border-amber-500/20" : ""
      }`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback
          className={`text-xs ${
            isOwnComment ? "bg-primary/20 text-primary" : "bg-secondary"
          }`}
        >
          {getInitials(comment.user?.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {comment.user?.full_name}
            {isOwnComment && (
              <span className="text-muted-foreground font-normal"> (You)</span>
            )}
          </span>

          {isTicketCreator && (
            <Badge variant="outline" className="text-xs">
              Creator
            </Badge>
          )}

          {comment.is_internal && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Lock className="h-2.5 w-2.5" />
              Internal
            </Badge>
          )}

          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>

        <div className="mt-1 text-sm whitespace-pre-wrap break-words">
          {comment.content}
        </div>
      </div>
    </div>
  );
}