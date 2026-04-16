export interface CommentModel {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  createdAt: number;
}
