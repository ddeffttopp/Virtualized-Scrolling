import { CommentModel } from '../models/comment.model';
import { PostModel } from '../models/post.model';
import { UserModel } from '../models/user.model';

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Sophia', 'Mason',
  'Isabella', 'Lucas', 'Mia', 'Ethan', 'Amelia', 'James', 'Harper',
  'Benjamin', 'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Ella', 'Daniel',
  'Scarlett', 'Michael', 'Grace', 'Jack', 'Chloe', 'Sebastian', 'Victoria'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King'
];

const TITLE_PARTS = [
  'Angular', 'Frontend', 'Scaling', 'Testing', 'Design', 'API', 'UX',
  'Performance', 'Signals', 'State', 'Search', 'Virtual Scroll', 'Architecture',
  'Component', 'TypeScript', 'Accessibility', 'Optimization', 'Filtering'
];

const BODY_SENTENCES = [
  'This article explores practical implementation details and trade-offs.',
  'The goal is to keep the user experience smooth even with large data sets.',
  'A clean architecture helps separate rendering concerns from state management.',
  'The feature works well when combined with efficient change detection.',
  'We can improve performance by rendering only the visible portion of the list.',
  'Search and sorting should remain responsive even while scrolling.',
  'Keyboard navigation is an important part of usability and accessibility.',
  'A tiny state store is enough for this demo and keeps the code simple.',
  'Variable item heights make the scroller more challenging to implement.',
  'The final result should feel fast, predictable, and easy to maintain.'
];

const COMMENT_SENTENCES = [
  'Nice breakdown, this makes the idea much easier to understand.',
  'I like how the example focuses on performance and clean code.',
  'This part about scrolling behavior is especially useful.',
  'Great point, I had the same issue in one of my projects.',
  'The explanation is concise and practical.',
  'I would love to see benchmarks for this approach.',
  'This seems like a solid trade-off for a demo assignment.',
  'Thanks, this clarified how the filtering should behave.',
  'Interesting implementation detail, especially around item recycling.',
  'That is a smart way to keep the UI responsive.'
];

const AVATAR_COLORS = [
  '#8FB7FF',
  '#7CC6FE',
  '#A7D7C5',
  '#B6C9F0',
  '#9DB4C0',
  '#C7D3DD',
  '#AFCBFF',
  '#9EC5FE'
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeUserName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  return `${first} ${last}`;
}

function makePostTitle(index: number): string {
  const a = TITLE_PARTS[index % TITLE_PARTS.length];
  const b = TITLE_PARTS[(index * 5 + 3) % TITLE_PARTS.length];
  return `${a} & ${b} #${index + 1}`;
}

function makePostBody(): string {
  const sentenceCount = randomInt(2, 5);
  const sentences = shuffle([...BODY_SENTENCES]).slice(0, sentenceCount);
  return sentences.join(' ');
}

function makeCommentBody(): string {
  const sentenceCount = randomInt(1, 3);
  const sentences = shuffle([...COMMENT_SENTENCES]).slice(0, sentenceCount);
  return sentences.join(' ');
}

export function generateUsers(count: number): UserModel[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: makeUserName(index),
    avatarColor: randomItem(AVATAR_COLORS),
    postCount: 0
  }));
}

export function generatePosts(count: number, users: UserModel[]): PostModel[] {
  const posts: PostModel[] = Array.from({ length: count }, (_, index) => {
    const user = randomItem(users);
    const createdAt =
      Date.now() - randomInt(0, 1000 * 60 * 60 * 24 * 180);

    return {
      id: index + 1,
      userId: user.id,
      title: makePostTitle(index),
      body: makePostBody(),
      createdAt,
      commentCount: randomInt(2, 15)
    };
  });

  const postCountByUser = new Map<number, number>();

  for (const post of posts) {
    postCountByUser.set(post.userId, (postCountByUser.get(post.userId) ?? 0) + 1);
  }

  for (const user of users) {
    user.postCount = postCountByUser.get(user.id) ?? 0;
  }

  return posts;
}

export function generateComments(postId: number, count?: number): CommentModel[] {
  const commentsCount = count ?? randomInt(2, 15);

  return Array.from({ length: commentsCount }, (_, index) => ({
    id: postId * 100 + index + 1,
    postId,
    authorName: makeUserName(postId + index),
    body: makeCommentBody(),
    createdAt: Date.now() - randomInt(0, 1000 * 60 * 60 * 24 * 14)
  }));
}
