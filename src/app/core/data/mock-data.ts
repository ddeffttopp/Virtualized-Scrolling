import { CommentModel } from '../models/comment.model';

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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

function makeCommentBody(): string {
  const sentenceCount = randomInt(1, 3);
  const sentences = shuffle([...COMMENT_SENTENCES]).slice(0, sentenceCount);
  return sentences.join(' ');
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
