"use client";

import { addComment, deleteComment, editComment } from "@/app/actions/comments";
import { MAX_COMMENT_DEPTH } from "@/config";
import { formatDateToNums } from "@/lib/utils";
import { ExtendedComment, ExtendedPost } from "@/types/db";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserAvatar from "./user-avatar";
import VoteButtons from "./vote-buttons";
import { CircleAlert, Image, MessagesSquare, Type } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommentSectionProps {
  post: ExtendedPost;
  session: Session | null;
  initialComments: ExtendedComment[];
  commentCount: number;
}

export default function CommentSection({
  post,
  session,
  initialComments,
  commentCount,
}: CommentSectionProps) {
  const router = useRouter();
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [mainInput, setMainInput] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isReplyWriting, setIsReplyWriting] = useState(false);
  const [attemptedEmptySubmit, setAttemptedEmptySubmit] = useState(false);
  const [attemptedEmptyReplySubmit, setAttemptedEmptyReplySubmit] =
    useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [discardReplyConfirm, setDiscardReplyConfirm] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [discardEditConfirm, setDiscardEditConfirm] = useState(false);
  const [deleteConfirmCommentId, setDeleteConfirmCommentId] = useState<
    string | null
  >(null);

  const handleReplyClick = (commentId: string) => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (replyInput.trim()) {
      setDiscardReplyConfirm(true);
      return;
    }

    setReplyToId(replyToId === commentId ? null : commentId);
    setIsReplyWriting(true);
  };

  const handleSubmit = async (
    postId: string,
    replyToId: string | null,
    text: string
  ) => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (!text.trim()) {
      replyToId
        ? setAttemptedEmptyReplySubmit(true)
        : setAttemptedEmptySubmit(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("postId", postId);
      if (replyToId) {
        formData.append("replyToId", replyToId);
      }
      formData.append("text", text);

      await addComment(formData);
      if (replyToId) {
        setReplyInput("");
        setIsReplyWriting(false);
      } else {
        setMainInput("");
        setIsWriting(false);
      }
      setReplyToId(null);

      toast({
        title: "Success",
        description: "You may need to reload the page to see changes.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the database.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (text: string, isReply: boolean) => {
    if (text.trim()) {
      isReply ? setDiscardReplyConfirm(true) : setDiscardConfirm(true);
      return;
    }
    isReply ? setIsReplyWriting(false) : setIsWriting(false);
  };

  const handleEdit = async (commentId: string, newText: string) => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (!newText.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsEditSubmitting(true);
    try {
      await editComment(commentId, newText);
      setEditingCommentId(null);
      setEditInput("");
      toast({
        title: "Success",
        description: "You may need to reload the page to see changes.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while editing the comment.",
        variant: "destructive",
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    try {
      await deleteComment(commentId);
      setDeleteConfirmCommentId(null);
      toast({
        title: "Success",
        description: "You may need to reload the page to see changes.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the comment.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = (text: string) => {
    if (editInput.trim() !== text) {
      setDiscardEditConfirm(true);
    } else {
      setEditingCommentId(null);
      setEditInput("");
    }
  };

  const renderComments = (commentsToRender: ExtendedComment[], depth = 0) => {
    return commentsToRender.map((comment) => (
      <div
        key={comment.id}
        className={`${
          0 < depth && depth <= MAX_COMMENT_DEPTH ? "ml-16" : ""
        } pt-4 mt-8`}
      >
        <div
          id={`comment-${comment.id}`}
          className="border-transparent transition-colors duration-2000 ease-out rounded-md"
        >
          <div className="flex justify-between items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <UserAvatar
                image={null}
                name={comment.author?.name}
                className="h-6 w-6"
              />
              <span className="font-bold">
                {comment.author?.name || "Anon"}
              </span>
              <span className="text-muted-foreground">
                {formatDateToNums(comment.createdAt)}
              </span>
            </div>
            <VoteButtons
              session={session}
              post={post}
              orientation="HORIZONTAL"
              comment={comment}
            />
          </div>

          {editingCommentId === comment.id ? (
            <div className="mt-2">
              <div
                className={`w-full rounded-md border border-input bg-transparent px-3 py-4 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring`}
              >
                <TextareaAutosize
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  minRows={3}
                  placeholder="Edit your comment"
                  className="w-full bg-transparent resize-none text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="w-full flex justify-between items-center mt-2">
                  <div className="flex gap-x-4 items-center text-muted-foreground text-sm">
                    <Image className="h-5 w-5 cursor-not-allowed" />
                    <Type className="h-5 w-5 cursor-not-allowed" />
                  </div>
                  <div className="flex gap-x-2 items-center">
                    <Button
                      className="h-fit py-1 px-3 text-sm opacity-70"
                      disabled={isEditSubmitting}
                      onClick={() => handleCancelEdit(comment.text)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="py-1 h-fit px-3 text-sm"
                      onClick={() => handleEdit(comment.id, editInput)}
                      disabled={isEditSubmitting}
                    >
                      {isEditSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <pre className="prose dark:prose-invert px-0 py-2 max-w-none whitespace-pre-wrap break-words">
              {comment.text}
            </pre>
          )}
          {!comment.deleted && (
            <div className="flex justify-start items-center gap-x-2">
              {depth < MAX_COMMENT_DEPTH && (
                <button
                  className="text-sm underline text-muted-foreground"
                  onClick={() => handleReplyClick(comment.id)}
                >
                  Reply
                </button>
              )}
              {comment.authorId === session?.user.id && (
                <>
                  <button
                    className="text-sm underline text-muted-foreground"
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditInput(comment.text);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm underline text-muted-foreground"
                    onClick={() => setDeleteConfirmCommentId(comment.id)}
                  >
                    Delete
                  </button>
                </>
              )}
              {comment.replyToId && (
                <a
                  href={`#comment-${comment.replyToId}`}
                  className="text-sm underline text-muted-foreground ml-2"
                  onClick={(e) => {
                    e.preventDefault();
                    const parentComment = document.getElementById(
                      `comment-${comment.replyToId}`
                    );
                    if (parentComment) {
                      parentComment.scrollIntoView({ behavior: "smooth" });
                      parentComment.classList.add("highlight-comment");
                      setTimeout(
                        () =>
                          parentComment.classList.remove("highlight-comment"),
                        2000
                      );
                    }
                  }}
                >
                  Jump to parent
                </a>
              )}
            </div>
          )}

          {replyToId === comment.id && isReplyWriting && (
            <>
              <div
                className={`w-full rounded-md border ${
                  attemptedEmptyReplySubmit ? "border-red-500" : "border-input"
                } bg-transparent px-3 py-4 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring mt-4`}
              >
                <TextareaAutosize
                  value={replyInput}
                  onChange={(e) => {
                    setReplyInput(e.target.value);
                    if (e.target.value.trim()) {
                      setAttemptedEmptyReplySubmit(false);
                    }
                  }}
                  minRows={3}
                  placeholder="Reply to this comment"
                  className="w-full bg-transparent resize-none text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="w-full flex justify-between items-center ">
                  <div className="flex gap-x-4 items-center text-muted-foreground text-sm">
                    <Image className="h-5 w-5 cursor-not-allowed" />
                    <Type className="h-5 w-5 cursor-not-allowed" />
                  </div>
                  <div className="flex gap-x-2 items-center">
                    <Button
                      className="h-fit py-1 px-3 text-sm opacity-70"
                      disabled={isSubmitting}
                      onClick={() => handleCancel(replyInput, true)}
                    >
                      Cancel
                    </Button>

                    <AlertDialog open={discardReplyConfirm}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Discard reply?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You have a reply in progress, are you sure you want
                            to discard it?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDiscardReplyConfirm(false)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setIsReplyWriting(false);
                              setDiscardReplyConfirm(false);
                              setReplyInput("");
                              setReplyToId(null);
                            }}
                          >
                            Discard
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      className="py-1 h-fit px-3 text-sm"
                      onClick={() =>
                        handleSubmit(post.id, comment.id, replyInput)
                      }
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Replying..." : "Reply"}
                    </Button>
                  </div>
                </div>
              </div>
              {attemptedEmptyReplySubmit && (
                <span className="text-red-500 text-sm flex items-center gap-x-1 mt-1">
                  <CircleAlert className="h-4 w-4" />
                  This field is required and cannot be empty.
                </span>
              )}
            </>
          )}
        </div>

        {comment.replies && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center my-5 ">
        <div className="flex justify-start items-center">
          <MessagesSquare />
          <h2
            className="flex justify-start ml-2 text-xl md:text-3xl "
            id="comments"
          >
            Comments ({commentCount})
          </h2>
        </div>
        {!isWriting && (
          <button className="underline" onClick={() => setIsWriting(true)}>
            Write a comment?
          </button>
        )}
      </div>
      {isWriting && (
        <>
          <div
            className={`w-full rounded-md border ${
              attemptedEmptySubmit ? "border-red-500" : "border-input"
            } bg-transparent px-3 py-4 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring`}
          >
            <TextareaAutosize
              id="description"
              value={mainInput}
              onChange={(e) => {
                setMainInput(e.target.value);
                if (e.target.value.trim()) {
                  setAttemptedEmptySubmit(false);
                }
              }}
              minRows={3}
              placeholder="Add a comment."
              className="w-full bg-transparent resize-none text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="w-full flex justify-between items-center ">
              <div className="flex gap-x-4 items-center text-muted-foreground text-sm">
                <Image className="h-5 w-5 cursor-not-allowed" />
                <Type className="h-5 w-5 cursor-not-allowed" />
              </div>
              <div className="flex gap-x-2 items-center">
                <Button
                  className="h-fit py-1 px-3 text-sm opacity-70"
                  disabled={isSubmitting}
                  onClick={() => handleCancel(mainInput, false)}
                >
                  Cancel
                </Button>

                <AlertDialog open={discardConfirm}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Discard comment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have a comment in progress, are you sure you want to
                        discard it?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDiscardConfirm(false)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setIsWriting(false);
                          setDiscardConfirm(false);
                          setMainInput("");
                        }}
                      >
                        Discard
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  className="py-1 h-fit px-3 text-sm"
                  onClick={() => handleSubmit(post.id, null, mainInput)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Commenting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
          {attemptedEmptySubmit && (
            <span className="text-red-500 text-sm flex items-center gap-x-1 mt-1">
              <CircleAlert className="h-4 w-4" />
              This field is required and cannot be empty.
            </span>
          )}
        </>
      )}

      <AlertDialog open={discardEditConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDiscardEditConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEditingCommentId(null);
                setEditInput("");
                setDiscardEditConfirm(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteConfirmCommentId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Replies to this comment will <b className="font-bold">not</b> be
              removed. Are you sure you want to delete this comment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmCommentId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmCommentId && handleDelete(deleteConfirmCommentId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {renderComments(initialComments as ExtendedComment[])}
    </div>
  );
}
