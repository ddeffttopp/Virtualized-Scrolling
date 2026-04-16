import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostModel } from '../../core/models/post.model';
import { UserModel } from '../../core/models/user.model';
import { CommentModel } from '../../core/models/comment.model';

@Component({
  selector: 'app-post-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './post-dialog.html',
  styleUrl: './post-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDialog implements OnInit, OnDestroy {
  @Input({ required: true }) post!: PostModel;
  @Input({ required: true }) author!: UserModel | null;
  @Input({ required: true }) comments: CommentModel[] = [];

  @Output() closed = new EventEmitter<void>();

  private previousBodyOverflow = '';

  ngOnInit(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousBodyOverflow;
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
