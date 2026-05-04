import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnChanges, OnDestroy,
  QueryList,
  signal,
  SimpleChanges,
  TemplateRef, ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface VisibleItem<T> {
  item: T;
  index: number;
  key: string | number;
}

@Component({
  selector: 'app-virtual-scroller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './virtual-scroller.html',
  styleUrl: './virtual-scroller.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScroller<T = unknown> implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) items: T[] = [];
  @Input() estimatedItemHeight = 80;
  @Input() overscan = 5;
  @Input() trackBy: (index: number, item: T) => string | number = (index) => index;
  @Input() emptyText = 'No items';

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<unknown>;

  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('itemElement') itemElements!: QueryList<ElementRef<HTMLElement>>;

  readonly visibleItems = signal<VisibleItem<T>[]>([]);
  readonly topPadding = signal(0);
  readonly bottomPadding = signal(0);

  private heightCache = new Map<string | number, number>();
  private offsets: number[] = [];
  private keys: Array<string | number> = [];

  private animationFrameId: number | null = null;
  private pendingScrollUpdate = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.rebuildOffsets();
      queueMicrotask(() => {
        this.updateVisibleItems();
      });
    }
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.updateVisibleItems();
      this.measureVisibleItems();
    });

    this.itemElements.changes.subscribe(() => {
      queueMicrotask(() => {
        this.measureVisibleItems();
      });
    });
  }

  onScroll(): void {
    this.scheduleVisibleItemsUpdate();
  }

  private scheduleVisibleItemsUpdate(): void {
    if (this.pendingScrollUpdate) {
      return;
    }

    this.pendingScrollUpdate = true;

    this.animationFrameId = requestAnimationFrame(() => {
      this.pendingScrollUpdate = false;
      this.animationFrameId = null;
      this.updateVisibleItems();
    });
  }

  ensureIndexVisible(index: number): void {
    const viewport = this.viewportRef.nativeElement;

    if (index < 0 || index >= this.items.length) {
      return;
    }

    const itemTop = this.offsets[index] ?? 0;
    const itemBottom = itemTop + this.getItemHeight(index);

    const viewTop = viewport.scrollTop;
    const viewBottom = viewTop + viewport.clientHeight;

    if (itemTop < viewTop) {
      viewport.scrollTop = itemTop;
      this.updateVisibleItems();
      return;
    }

    if (itemBottom > viewBottom) {
      viewport.scrollTop = itemBottom - viewport.clientHeight;
      this.updateVisibleItems();
    }
  }

  getTemplateContext(item: VisibleItem<T>) {
    return {
      $implicit: item.item,
      index: item.index
    };
  }

  private updateVisibleItems(): void {
    const viewport = this.viewportRef.nativeElement;
    const viewportHeight = viewport.clientHeight;
    const scrollTop = viewport.scrollTop;

    if (!this.items.length) {
      this.visibleItems.set([]);
      this.topPadding.set(0);
      this.bottomPadding.set(0);
      this.cdr.markForCheck();
      return;
    }

    const startIndex = this.findStartIndex(scrollTop);
    const endIndex = this.findEndIndex(scrollTop + viewportHeight);

    const from = Math.max(0, startIndex - this.overscan);
    const to = Math.min(this.items.length - 1, endIndex + this.overscan);

    const nextVisible: VisibleItem<T>[] = [];
    for (let i = from; i <= to; i++) {
      nextVisible.push({
        item: this.items[i],
        index: i,
        key: this.getKey(i, this.items[i])
      });
    }

    const topPadding = this.offsets[from] ?? 0;
    const bottomPadding = Math.max(
      0,
      this.getTotalHeight() - topPadding - this.getRangeHeight(from, to)
    );

    this.visibleItems.set(nextVisible);
    this.topPadding.set(topPadding);
    this.bottomPadding.set(bottomPadding);

    this.cdr.markForCheck();
  }

  private measureVisibleItems(): void {
    const visible = this.visibleItems();
    if (!visible.length || !this.itemElements.length) {
      return;
    }

    let changed = false;

    this.itemElements.forEach((elementRef, i) => {
      const item = visible[i];
      if (!item) {
        return;
      }

      const measured = Math.ceil(elementRef.nativeElement.getBoundingClientRect().height);
      const prev = this.heightCache.get(item.key);

      if (measured > 0 && prev !== measured) {
        this.heightCache.set(item.key, measured);
        changed = true;
      }
    });

    if (changed) {
      this.rebuildOffsets();
      this.updateVisibleItems();
    }
  }

  private rebuildOffsets(): void {
    this.offsets = new Array(this.items.length);
    this.keys = new Array(this.items.length);

    let offset = 0;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const key = this.getKey(i, item);

      this.keys[i] = key;
      this.offsets[i] = offset;
      offset += this.heightCache.get(key) ?? this.estimatedItemHeight;
    }
  }

  private getKey(index: number, item: T): string | number {
    return this.trackBy(index, item);
  }

  private getItemHeight(index: number): number {
    const key = this.keys[index];
    return this.heightCache.get(key) ?? this.estimatedItemHeight;
  }

  private getRangeHeight(from: number, to: number): number {
    let total = 0;

    for (let i = from; i <= to; i++) {
      total += this.getItemHeight(i);
    }

    return total;
  }

  private getTotalHeight(): number {
    if (!this.items.length) {
      return 0;
    }

    const last = this.items.length - 1;
    return (this.offsets[last] ?? 0) + this.getItemHeight(last);
  }

  private findStartIndex(scrollTop: number): number {
    let low = 0;
    let high = this.items.length - 1;
    let result = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const top = this.offsets[mid];
      const bottom = top + this.getItemHeight(mid);

      if (bottom >= scrollTop) {
        result = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return result;
  }

  private findEndIndex(bottomEdge: number): number {
    let low = 0;
    let high = this.items.length - 1;
    let result = this.items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const top = this.offsets[mid];

      if (top <= bottomEdge) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.pendingScrollUpdate = false;
  }
}
