import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter, HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCard } from '../post-card/post-card';
import { PostSort } from '../../core/store/app.store';
import { PostModel } from '../../core/models/post.model';
import { UserModel } from '../../core/models/user.model';
import { VirtualScroller } from '../../shared/components/virtual-scroller/virtual-scroller';

@Component({
  selector: 'app-posts-panel',
  standalone: true,
  imports: [CommonModule, PostCard, VirtualScroller],
  templateUrl: './posts-panel.html',
  styleUrl: './posts-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsPanel implements OnChanges {
  @Input({ required: true }) posts: PostModel[] = [];
  @Input({ required: true }) totalPostsCount = 0;
  @Input({ required: true }) search = '';
  @Input({ required: true }) sort: PostSort = 'recent';
  @Input({ required: true }) resolveAuthor!: (userId: number) => UserModel | null;
  @Input() dialogOpen = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<PostSort>();
  @Output() postOpened = new EventEmitter<PostModel>();
  @Output() searchCleared = new EventEmitter<void>();

  @ViewChild(VirtualScroller)
  scroller?: VirtualScroller<PostModel>;

  searchDraft = '';
  activePostId: number | null = null;
  isListInteracted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['search']) {
      this.searchDraft = this.search;
    }

    if (changes['posts']) {
      this.syncActivePost();
    }

    if (changes['dialogOpen'] && this.dialogOpen) {
      this.isListInteracted = false;
    }
  }

  trackByPostId = (_: number, post: PostModel): number => post.id;

  onSearchInput(event: Event): void {
    this.searchDraft = (event.target as HTMLInputElement).value;
    this.searchChange.emit(this.searchDraft);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as PostSort;
    this.sortChange.emit(value);
  }

  openPost(post: PostModel): void {
    this.activePostId = post.id;
    this.isListInteracted = true;
    this.postOpened.emit(post);
  }

  setActivePost(postId: number): void {
    this.activePostId = postId;
    this.isListInteracted = true;
  }

  isActive(postId: number): boolean {
    return this.isListInteracted && this.activePostId === postId;
  }

  onPanelFocusIn(): void {
    if (this.dialogOpen || !this.posts.length) {
      return;
    }

    this.isListInteracted = true;
  }

  onPanelBlur(): void {
    if (!this.dialogOpen) {
      return;
    }

    this.isListInteracted = false;
  }

  onListKeydown(event: KeyboardEvent): void {
    if (this.dialogOpen) {
      return;
    }

    if (!this.posts.length) {
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') {
      return;
    }

    if (!this.isListInteracted) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Enter') {
      const activePost = this.posts.find(post => post.id === this.activePostId);
      if (activePost) {
        this.postOpened.emit(activePost);
      }
      return;
    }

    const currentIndex = this.posts.findIndex(post => post.id === this.activePostId);

    if (currentIndex === -1) {
      const initialIndex = event.key === 'ArrowUp' ? this.posts.length - 1 : 0;
      const initialPost = this.posts[initialIndex];

      if (!initialPost) {
        return;
      }

      this.activePostId = initialPost.id;
      this.scroller?.ensureIndexVisible(initialIndex);
      return;
    }

    const safeIndex = currentIndex;

    const nextIndex =
      event.key === 'ArrowDown'
        ? Math.min(this.posts.length - 1, safeIndex + 1)
        : Math.max(0, safeIndex - 1);

    const nextPost = this.posts[nextIndex];
    if (!nextPost) {
      return;
    }

    this.activePostId = nextPost.id;
    this.scroller?.ensureIndexVisible(nextIndex);
  }

  private syncActivePost(): void {
    if (!this.posts.length) {
      this.activePostId = null;
      this.isListInteracted = false;
      return;
    }

    if (this.activePostId === null) {
      return;
    }

    const exists = this.posts.some(post => post.id === this.activePostId);

    if (!exists) {
      this.activePostId = null;
      this.isListInteracted = false;
    }
  }

  clearActivePost(): void {
    this.activePostId = null;
    this.isListInteracted = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.handleGlobalClick(event);
  }

  handleGlobalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isPost = target.closest('.post-row');
    const isDialog = target.closest('.dialog-backdrop');

    if (isPost || isDialog) {
      return;
    }

    this.clearActivePost();
  }

  clearSearch(): void {
    this.searchDraft = '';
    this.searchCleared.emit();
  }
}
