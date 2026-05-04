import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
  effect,
  EffectRef,
  Injector, OnDestroy, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore, PostSort } from './core/store/app.store';
import { PostsPanel } from './features/posts-panel/posts-panel';
import { UsersPanel } from './features/users-panel/users-panel';
import { PostDialog } from './features/post-dialog/post-dialog';
import { PostModel } from './core/models/post.model';
import { UserModel } from './core/models/user.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    UsersPanel,
    PostsPanel,
    PostDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, OnDestroy {
  readonly store = inject(AppStore);

  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly searchInput$ = new Subject<string>();

  private urlSyncEffectRef: EffectRef | null = null;
  private isRestoringFromUrl = true;

  readonly usersMap = computed(() => {
    const map = new Map<number, UserModel>();

    for (const user of this.store.users()) {
      map.set(user.id, user);
    }

    return map;
  });

  async ngOnInit(): Promise<void> {
    await this.store.init();

    this.initSearchDebounce();
    this.restoreStateFromBrowserUrl();
    this.initUrlSync();

    this.isRestoringFromUrl = false;
  }

  ngOnDestroy(): void {
    this.urlSyncEffectRef?.destroy();
  }

  private initSearchDebounce(): void {
    this.searchInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.store.setPostSearch(value);
      });
  }

  private restoreStateFromBrowserUrl(): void {
    const params = new URLSearchParams(window.location.search);

    const usersParam = params.get('users');
    const searchParam = params.get('search');
    const sortParam = params.get('sort');

    const usersSelected = usersParam
      ? usersParam
        .split(',')
        .map(value => Number(value.trim()))
        .filter(value => Number.isInteger(value) && value > 0)
      : [];

    const sort: PostSort =
      sortParam === 'title' || sortParam === 'recent'
        ? sortParam
        : 'recent';

    this.store.restoreState({
      usersSelected,
      postSearch: searchParam ?? '',
      sort
    });
  }

  private initUrlSync(): void {
    this.urlSyncEffectRef?.destroy();

    this.urlSyncEffectRef = effect(
      () => {
        if (this.isRestoringFromUrl) {
          return;
        }

        const selectedUsers = Array.from(this.store.usersSelected()).sort((a, b) => a - b);
        const search = this.store.postSearch().trim();
        const sort = this.store.sort();

        const queryParts: string[] = [];

        if (selectedUsers.length > 0) {
          queryParts.push(`users=${selectedUsers.join(',')}`);
        }

        if (search) {
          queryParts.push(`search=${encodeURIComponent(search)}`);
        }

        queryParts.push(`sort=${encodeURIComponent(sort)}`);

        const queryString = queryParts.join('&');
        const nextUrl = queryString
          ? `${window.location.pathname}?${queryString}`
          : window.location.pathname;

        window.history.replaceState({}, '', nextUrl);
      },
      { injector: this.injector }
    );
  }

  resolveAuthor = (userId: number): UserModel | null => {
    return this.usersMap().get(userId) ?? null;
  };

  toggleUser = (userId: number): void => {
    this.store.toggleUser(userId);
  };

  clearSelection = (): void => {
    this.store.clearUsersSelection();
  };

  onSearchChange = (value: string): void => {
    this.searchInput$.next(value);
  };

  onSearchCleared = (): void => {
    this.searchInput$.next('');
    this.store.setPostSearch('');
  };

  onSortChange = (value: PostSort): void => {
    this.store.setSort(value);
  };

  openPost = (post: PostModel): void => {
    this.store.openPost(post);
  };

  closePost = (): void => {
    this.store.closePost();
  };
}
