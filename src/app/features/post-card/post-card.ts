import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostModel } from '../../core/models/post.model';
import { UserModel } from '../../core/models/user.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCard {
  @Input({ required: true }) post!: PostModel;
  @Input({ required: true }) author!: UserModel | null;

  get previewBody(): string {
    if (this.post.body.length <= 160) {
      return this.post.body;
    }

    return `${this.post.body.slice(0, 160)}...`;
  }
}
