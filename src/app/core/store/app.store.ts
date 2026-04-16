import { computed, Injectable, signal } from '@angular/core';
import { generateComments, generatePosts, generateUsers } from '../data/mock-data';
import { CommentModel } from '../models/comment.model';
import { PostModel } from '../models/post.model';
import { UserModel } from '../models/user.model';

export type PostSort = 'recent' | 'title';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  readonly users = signal<UserModel[]>([]);
  readonly posts = signal<PostModel[]>([]);

  readonly usersSelected = signal<Set<number>>(new Set<number>());
  readonly postSearch = signal<string>('');
  readonly sort = signal<PostSort>('recent');

  readonly selectedPost = signal<PostModel | null>(null);
  readonly selectedPostComments = signal<CommentModel[]>([]);

  readonly filteredPosts = computed(() => {
    const selectedUsers = this.usersSelected();
    const search = this.postSearch().trim().toLowerCase();
    const sort = this.sort();

    let result = this.posts();

    if (selectedUsers.size > 0) {
      result = result.filter(post => selectedUsers.has(post.userId));
    }

    if (search) {
      result = result.filter(post => {
        const haystack = `${post.title} ${post.body}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    result = [...result].sort((a, b) => {
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      }

      return b.createdAt - a.createdAt;
    });

    return result;
  });

  readonly totalUsersCount = computed(() => this.users().length);
  readonly totalPostsCount = computed(() => this.posts().length);

  init(): void {
    const users = generateUsers(1000);
    const posts = generatePosts(10000, users);

    this.users.set(users);
    this.posts.set(posts);
  }

  restoreState(params: {
    usersSelected?: number[];
    postSearch?: string;
    sort?: PostSort;
  }): void {
    const validUserIds = new Set(this.users().map(user => user.id));

    const selected = new Set<number>();
    for (const userId of params.usersSelected ?? []) {
      if (validUserIds.has(userId)) {
        selected.add(userId);
      }
    }

    this.usersSelected.set(selected);
    this.postSearch.set(params.postSearch ?? '');
    this.sort.set(params.sort ?? 'recent');
  }

  toggleUser(userId: number): void {
    const next = new Set(this.usersSelected());

    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }

    this.usersSelected.set(next);
  }

  clearUsersSelection(): void {
    this.usersSelected.set(new Set<number>());
  }

  setPostSearch(value: string): void {
    this.postSearch.set(value);
  }

  setSort(sort: PostSort): void {
    this.sort.set(sort);
  }

  openPost(post: PostModel): void {
    this.selectedPost.set(post);
    this.selectedPostComments.set(generateComments(post.id, post.commentCount));
  }

  closePost(): void {
    this.selectedPost.set(null);
    this.selectedPostComments.set([]);
  }
}
