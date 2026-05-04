import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

let seed = 42;

function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomItem(items) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function makeUserName(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];

  return `${first} ${last}`;
}

function makePostTitle(index) {
  const a = TITLE_PARTS[index % TITLE_PARTS.length];
  const b = TITLE_PARTS[(index * 5 + 3) % TITLE_PARTS.length];

  return `${a} & ${b} #${index + 1}`;
}

function makePostBody() {
  const sentenceCount = randomInt(2, 5);
  const sentences = shuffle(BODY_SENTENCES).slice(0, sentenceCount);

  return sentences.join(' ');
}

function generateUsers(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: makeUserName(index),
    avatarColor: randomItem(AVATAR_COLORS),
    postCount: 0
  }));
}

function generatePosts(count, users) {
  const fixedNow = new Date('2026-01-01T00:00:00.000Z').getTime();

  const posts = Array.from({ length: count }, (_, index) => {
    const user = randomItem(users);
    const createdAt = fixedNow - randomInt(0, 1000 * 60 * 60 * 24 * 180);

    return {
      id: index + 1,
      userId: user.id,
      title: makePostTitle(index),
      body: makePostBody(),
      createdAt,
      commentCount: randomInt(2, 15)
    };
  });

  const postCountByUser = new Map();

  for (const post of posts) {
    postCountByUser.set(post.userId, (postCountByUser.get(post.userId) ?? 0) + 1);
  }

  for (const user of users) {
    user.postCount = postCountByUser.get(user.id) ?? 0;
  }

  return posts;
}

const users = generateUsers(1000);
const posts = generatePosts(10000, users);

const outputPath = join(process.cwd(), 'public', 'mock-data.json');

mkdirSync(dirname(outputPath), { recursive: true });

writeFileSync(
  outputPath,
  JSON.stringify({ users, posts }, null, 2),
  'utf-8'
);

console.log(`Generated ${users.length} users and ${posts.length} posts`);
console.log(`Saved to ${outputPath}`);
