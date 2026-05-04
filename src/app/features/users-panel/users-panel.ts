import {
  ChangeDetectionStrategy,
  Component, EventEmitter,
  HostListener,
  Input,
  OnChanges, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../core/models/user.model';
import { UserCard } from '../user-card/user-card';
import { VirtualScroller } from '../../shared/components/virtual-scroller/virtual-scroller';

@Component({
  selector: 'app-users-panel',
  standalone: true,
  imports: [CommonModule, UserCard, VirtualScroller],
  templateUrl: './users-panel.html',
  styleUrl: './users-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPanel implements OnChanges {
  @Input({ required: true }) users: UserModel[] = [];
  @Input({ required: true }) selectedUserIds: Set<number> = new Set<number>();
  @Input({ required: true }) totalUsersCount = 0;

  @Output() userToggled = new EventEmitter<number>();
  @Output() selectionCleared = new EventEmitter<void>();

  @ViewChild(VirtualScroller)
  scroller?: VirtualScroller<UserModel>;

  activeUserId: number | null = null;
  isListInteracted = false;

  private shouldActivateOnNextFocus = false;

  trackByUserId = (_: number, user: UserModel): number => user.id;

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.shouldActivateOnNextFocus = true;
    }
  }
  @HostListener('document:pointerdown')
  onDocumentPointerDown(): void {
    this.shouldActivateOnNextFocus = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users']) {
      this.syncActiveUser();
    }
  }

  isSelected(userId: number): boolean {
    return this.selectedUserIds.has(userId);
  }

  isActive(userId: number): boolean {
    return this.isListInteracted && this.activeUserId === userId;
  }

  onUserClick(userId: number): void {
    this.userToggled.emit(userId);
    this.isListInteracted = false;
    this.activeUserId = null;
  }

  onPanelFocusIn(): void {
    if (!this.users.length) {
      return;
    }

    this.isListInteracted = true;

    if (!this.shouldActivateOnNextFocus) {
      return;
    }

    if (this.activeUserId === null) {
      this.activeUserId = this.users[0].id;
    }

    this.shouldActivateOnNextFocus = false;
  }

  onPanelFocusOut(event: FocusEvent): void {
    const nextFocused = event.relatedTarget as Node | null;
    const currentTarget = event.currentTarget as HTMLElement | null;

    if (currentTarget && nextFocused && currentTarget.contains(nextFocused)) {
      return;
    }

    this.isListInteracted = false;
    this.activeUserId = null;
  }

  onListKeydown(event: KeyboardEvent): void {
    if (!this.users.length) {
      return;
    }

    const allowedKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
    if (!allowedKeys.includes(event.key)) {
      return;
    }

    if (!this.isListInteracted) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Enter' || event.key === ' ') {
      const activeUser = this.users.find(user => user.id === this.activeUserId);
      if (activeUser) {
        this.userToggled.emit(activeUser.id);
      }
      return;
    }

    const currentIndex = this.users.findIndex(user => user.id === this.activeUserId);

    if (currentIndex === -1) {
      const initialIndex = event.key === 'ArrowUp' ? this.users.length - 1 : 0;
      const initialUser = this.users[initialIndex];

      if (!initialUser) {
        return;
      }

      this.activeUserId = initialUser.id;
      this.scroller?.ensureIndexVisible(initialIndex);
      return;
    }

    const nextIndex =
      event.key === 'ArrowDown'
        ? Math.min(this.users.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);

    const nextUser = this.users[nextIndex];
    if (!nextUser) {
      return;
    }

    this.activeUserId = nextUser.id;
    this.scroller?.ensureIndexVisible(nextIndex);
  }

  clearActiveUser(): void {
    this.activeUserId = null;
    this.isListInteracted = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isUser = target.closest('.user-row');
    if (isUser) {
      return;
    }

    this.clearActiveUser();
  }

  private syncActiveUser(): void {
    if (!this.users.length) {
      this.activeUserId = null;
      this.isListInteracted = false;
      return;
    }

    if (this.activeUserId === null) {
      return;
    }

    const exists = this.users.some(user => user.id === this.activeUserId);
    if (!exists) {
      this.activeUserId = null;
      this.isListInteracted = false;
    }
  }
}
