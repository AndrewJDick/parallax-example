export default class ParallaxGrid {

  constructor() {
    this.scrollAttr = {
      previous: 0,
      current: 0,
      direction: false,
      ticking: false
    };

    this.gridClasses = { 
      row:  'c-grid__row',
      upper: 'u-positioning--upper', 
      lower: 'u-positioning--lower',
    };

    this.gridElements = {
      quadrants: document.querySelectorAll('.c-grid__quadrant'),
      rows: document.querySelectorAll('.c-grid__row'),
      panels: document.querySelectorAll('.c-grid__panel')
    };

    this.listeners();
  }

  listeners() {
    window.addEventListener('scroll', () => this.onScroll(), false);
  }

  onScroll() {
    this.scrollAttr.current = window.pageYOffset || document.documentElement.scrollTop;

    // Determine which way the user is scrolling
    this.scrollDirection();
    
    // Debounce & Update
    this.requestTick(); 

    this.scrollAttr.previous = this.scrollAttr.current;
  }

  scrollDirection() { 
    if (this.scrollAttr.current > this.scrollAttr.previous) {
      // Scroll Down
      this.scrollAttr.direction = true;   
    } else {
      // Scroll Up
      this.scrollAttr.direction = false;  
    }
  }

  requestTick() {
    if(!this.scrollAttr.ticking) {
      window.requestAnimationFrame(() => this.update());
    }
    this.scrollAttr.ticking = true;
  }

  configureElem(elem, z1, z2, position = "relative") {

    switch(position) {
      case "fixed":
        elem.firstElementChild.classList.add(this.gridClasses.upper);
        elem.firstElementChild.style.zIndex = z1;

        elem.lastElementChild.classList.add(this.gridClasses.lower);
        elem.lastElementChild.style.zIndex = z2;
        break;

      case "relative":
        elem.firstElementChild.classList.remove(this.gridClasses.upper);
        elem.firstElementChild.style.zIndex = z1;

        elem.lastElementChild.classList.remove(this.gridClasses.lower);
        elem.lastElementChild.style.zIndex = z2;
        break;
    }
  }

  clearClasses(elem) {
    for (let e = 0; e < elem.length; e++) {   
      elem[e].classList.remove(this.gridClasses.upper);
      elem[e].classList.remove(this.gridClasses.lower);
    }
  }

  isMobileLayout(panel) {
    const gridStyle = window.getComputedStyle(panel, null);
    const gridWidth = parseInt(gridStyle.width);

    if (gridWidth === window.innerWidth) {
      return true;
    }
    
    return false; 
  }

  getPosition(elem) {
    const position = {
      currentTop: elem.getAttribute('data-cT'),
      currentBot: elem.getAttribute('data-cB'),
      previousTop: elem.getAttribute('data-pT'),
      previousBot: elem.getAttribute('data-pB')
    };

    return position;
  }

  update() { 
    this.scrollAttr.ticking = false;

    const viewportHeight = window.innerHeight;
    const isMobile = this.isMobileLayout(this.gridElements.panels[0]);

    for (let r = 0; r < this.gridElements.rows.length; r++) {
      
      const row = this.gridElements.rows[r];
      
      const quadrant = {
        current: row.parentElement,
        next: row.parentElement.nextElementSibling,
        previous: row.parentElement.previousElementSibling
      };

      // Single Column (Mobile)
      if (isMobile === true) {

        const rowPosition = this.getPosition(row);
        
        // Set Current Position
        row.setAttribute('data-cT', row.getBoundingClientRect().top);
        row.setAttribute('data-cB', row.getBoundingClientRect().bottom);

        // Scroll Down
        if (rowPosition.previousTop > 0 && rowPosition.currentTop <= 0 && this.scrollAttr.direction) {

          this.configureElem(row, 5, 15, "fixed");

          if (row.nextElementSibling) {
            this.configureElem(row.nextElementSibling, 10, 20);
          } 

          if (row.previousElementSibling) {
            this.configureElem(row.previousElementSibling, 10, 20);
          }

          if (quadrant.next) {
            this.configureElem(quadrant.next.firstElementChild, 10, 20);
          } else if (!row.nextElementSibling) {
            this.clearClasses(this.gridElements.panels, this.gridClasses);
          }

          if (quadrant.previous) {
            this.configureElem(quadrant.previous.lastElementChild, 10, 20); 
          }
                
        }

        // Scroll Up
        if (rowPosition.previousBot < viewportHeight && rowPosition.currentBot >= viewportHeight && !this.scrollAttr.direction) {

          this.configureElem(row, 15, 5, "fixed");

          if (row.nextElementSibling) {
            this.configureElem(row.nextElementSibling, 20, 10);
          } 

          if (row.previousElementSibling) {
            this.configureElem(row.previousElementSibling, 20, 10);
          }

          if (quadrant.previous) {
            this.configureElem(quadrant.previous.lastElementChild, 20, 10);
          } else if (!row.previousElementSibling) {
            this.clearClasses(this.gridElements.panels, this.gridClasses);
          }

          if (quadrant.next) {
            this.configureElem(quadrant.next.firstElementChild, 20, 10);
          }
        }

        // Set Previous Position
        row.setAttribute('data-pT', rowPosition.currentTop);
        row.setAttribute('data-pB', rowPosition.currentBot);
      }

      // Twin column (Desktop)
      else {
        
        const quadrantPosition = this.getPosition(quadrant.current);

        // Set Current Position
        quadrant.current.setAttribute('data-cT', quadrant.current.getBoundingClientRect().top);
        quadrant.current.setAttribute('data-cB', quadrant.current.getBoundingClientRect().bottom);
        
        // Scroll Down
        if (quadrantPosition.previousTop > 0 && quadrantPosition.currentTop <= 0 && this.scrollAttr.direction) {

          this.configureElem(quadrant.current, 5, 15, "fixed");

          if (quadrant.next) {
            this.configureElem(quadrant.next, 10, 20);
          } else {
            this.clearClasses(this.gridElements.rows);  
          }

          if (quadrant.previous) {
            this.configureElem(quadrant.previous, 10, 20);
          }
        }

        // Scroll Up
        if (quadrantPosition.previousBot < viewportHeight && quadrantPosition.currentBot >= viewportHeight && !this.scrollAttr.direction) {

          this.configureElem(quadrant.current, 15, 5, "fixed");

          if (quadrant.next) {
            this.configureElem(quadrant.next, 20, 10);
          }

          if (quadrant.previous) {
            this.configureElem(quadrant.previous, 20, 10);
          } else {
            this.clearClasses(this.gridElements.rows);  
          }
        }

        // Set Previous Position
        quadrant.current.setAttribute('data-pT', quadrantPosition.currentTop);
        quadrant.current.setAttribute('data-pB', quadrantPosition.currentBot);
      }
    }
  }
}
