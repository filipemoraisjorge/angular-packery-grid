import { Component, OnInit, HostListener } from '@angular/core';
import { AfterViewInit, OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import Packery from 'packery';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})

export class GridComponent implements OnInit, AfterViewInit, OnChanges {

  public items: Item[];
  private pckry: Packery;

  private _styles;

  private oneWidth: number;
  private noOfOneColumns: number;
  private containerWidth: number;

  private MIN_WIDTH = 150;
  private ASPECT_RATIO = 1 / 1;

  get styles() {
    const aspectRatio = this.ASPECT_RATIO;
    const baseOneWidth = this.oneWidth;
    const oneWidth = baseOneWidth;
    const oneHeight = baseOneWidth / aspectRatio;

    const itemStyles = {
      gridItem: {},
      gridItem1x1: {
        width: `${oneWidth}px`,
        height: `${oneHeight}px`,
        background: '#235'
      },
      gridItem2x1: {
        width: `${2 * oneWidth}px`,
        height: `${oneHeight}px`,
        background: '#247'
      },
      gridItem1x2: {
        width: `${oneWidth}px`,
        height: `${2 * oneHeight}px`,
        background: '#458'
      },
      gridItem2x2: {
        width: `${2 * oneWidth}px`,
        height: `${2 * oneHeight}px`,
        background: '#125'
      },
    };
    return itemStyles;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeItems(event);
  }

  ngOnInit() {
    this.items = this.randomizeItems([], 0);
  }

  ngAfterViewInit() {

    const grid = document.getElementById('grid');
      this.pckry = new Packery(grid, {
        itemSelector: '.grid-item',
        // disable window resize behavior
        shiftResize: true,
        resize: true,
        gutter: 0,
        stagger: 0
      });
      this.resizeItems(true);

//    this.pckry = this.pckry.bind(this);

  }

  ngOnChanges(changes) {
    console.log('onchages', changes);
  }

  public addItem() {
    const item = this.randomizeItems([], 1)[0];
    item.text = "new item";
    this.items.unshift(item);
    this.pckry.prepended('<div class="grid-item gridItem1x1"><p>injected</p></div>');
    console.log(this.items);
    this.pckry.reloadItems();
    const elements = this.pckry.getItemElements();
    console.log('reload', elements);
    this.pckry.layout();
    console.log('layout');
  }

  layoutItems() {
    this.pckry.layout();

  }
  reloadItems() {
    this.pckry.reloadItems();

  }

  getGridItemStyle(item: Item): any {
    return this.styles[`gridItem${item.w}x${item.h}`];
  }

  getGridItemClass(item: Item): string {
    return `grid-item gridItem${item.w}x${item.h}`;
  }

  resizeItems(event: Event | boolean) {
    const prevOneWidth = this.oneWidth;
    const prevNoOfOneColumns = this.noOfOneColumns;
    const prevContainerWidth = this.containerWidth;
    const forceResize = typeof event === 'boolean' && event === true;
    this.setWidth();
    const bigChange = Math.abs(prevContainerWidth - this.containerWidth) >= 100;

    this.debounce(() => {
      const formats = ['gridItem1x1', 'gridItem2x2', 'gridItem1x2', 'gridItem2x1'];
      if (forceResize || prevOneWidth !== this.oneWidth || prevNoOfOneColumns !== this.noOfOneColumns) {
        formats.forEach(format => {
          const formatElements = document.getElementsByClassName(format);
          if (formatElements !== null) {
            for (let i = 0; i < formatElements.length; i++) {
              const elem = formatElements.item(i);
              console.log(elem);
              // elem.style.width = this.styles[format].width;
              // elem.style.height = this.styles[format].height;
            }
          }
        });
        this.pckry.layout();
      }
    }, forceResize || bigChange ? 0 : 250)();
  }

  setWidth() {
    const containerWidth = this.containerWidth = document.getElementById('grid').offsetWidth;
    this.noOfOneColumns = Math.floor(containerWidth / this.MIN_WIDTH);
    this.oneWidth = containerWidth / this.noOfOneColumns;
    console.log('setWidth', containerWidth, this.noOfOneColumns, this.oneWidth);
  }


  random(min: number, max: number): number {
    return min + Math.round(Math.random() * (max - min));
  }

  randomizeItems(array: Item[], qtyItems: number): Item[] {
    for (let i = 0; i < qtyItems; i++) {
      array.push({
        text: `${i}`,
        w: this.random(1, 2),
        h: this.random(1, 2),
      });
    }
    return array;
  }

  // source: https://gist.github.com/nmsdvid/8807205
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  debounce(func, wait, immediate?) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      }, wait);
      if (immediate && !timeout) { func.apply(context, args); }
    };
  }

}

export interface Item {
  text: string;
  w: number;
  h: number;
}
