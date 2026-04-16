import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../core/models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCard {
  @Input({ required: true }) user!: UserModel;
  @Input({ required: true }) selected = false;

  get initials(): string {
    return this.user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
