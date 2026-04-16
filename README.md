# Virtualized Scrolling Demo (Angular)

## Overview

This project is a demo application built with **Angular 17+ (standalone components)** that demonstrates:

* Custom virtualized scrolling (no CDK / third-party libraries)
* Efficient rendering of large datasets (1,000 users and 10,000 posts)
* Keyboard navigation
* URL-synchronized state
* Debounced search and sorting

---

## Features

### Data

* 1,000 generated users
* 10,000 generated posts
* Each post is assigned to a random user
* Post dialog shows **2–15 randomly generated comments**

---

### Layout

* Two-column layout:

  * **Left:** Users list
  * **Right:** Posts list
* Sticky headers with live counts

---

### Users

* Multi-select users
* Toggle selection by click or keyboard (`Enter` / `Space`)
* If no users are selected → all posts are shown

---

### Posts

* Filtered by selected users
* Search (title + body, case-insensitive)
* Sort by:

  * `recent`
  * `title`
* Click or press `Enter` to open post dialog

---

### Post Dialog

* Displays post details and comments
* Closes via:

  * Close button
  * Backdrop click
  * `Escape` key
* Background scrolling is disabled while open

---

## Virtual Scroller (Custom Implementation)

A custom virtual scrolling solution was implemented for both lists.

### Key features:

* Supports **variable item heights**
* Uses **item recycling**
* Renders only visible items + overscan
* Maintains smooth scrolling (~60 FPS target)
* Uses `trackBy` to minimize DOM churn

---

## State Management

A lightweight store is implemented using **Angular Signals** (no NgRx).

### Store state:

* `usersSelected: Set<number>`
* `postSearch: string`
* `sort: 'recent' | 'title'`

---

## URL Synchronization

Application state is synced with URL query parameters:

Example:

```
?users=1,2,3&search=angular&sort=title
```

* Restores state after page reload
* Enables deep linking

---

## Search & Performance

* Debounced search (200ms)
* Stale request cancellation
* Instant clear (no debounce delay)

---

## Performance Techniques

* `ChangeDetectionStrategy.OnPush` everywhere
* Custom virtual scrolling
* `trackBy` in all lists
* DOM recycling
* Debounced input handling
* No impure pipes

---

## Tech Stack

* Angular 17+
* Standalone components
* TypeScript (strict mode)
* SCSS

---

## How to Run Locally

```bash
npm install
ng serve
```

Open in browser:

```
http://localhost:4200
```

---

## Build

```bash
ng build
```

---

## Notes

* No external UI libraries or virtual scroll libraries were used
* Styling and UX decisions were made to balance simplicity and clarity
* The project focuses on performance and architecture rather than design complexity
