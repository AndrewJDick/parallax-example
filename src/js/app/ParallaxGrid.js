export default class ParallaxGrid {
  
  constructor(gridId) {
    
    this.grid = document.getElementById(gridId);

    this.gridClasses = {
      upper: 'u-positioning--upper', 
      lower: 'u-positioning--lower',
      relative: 'u-positioning--relative'
    };

    this.gridElements = {
      quadrants: this.grid.querySelectorAll('.c-grid__quadrant'),
      rows: this.grid.querySelectorAll('.c-grid__row')
    };

    this.lastQuadrant = this.gridElements.quadrants[this.gridElements.quadrants.length - 1];
    this.scrollTick = false;
    this.rowHeight = 0;
    this.gridTop = 0;

    this.setRowZindex();
    this.listeners();
  }

  resize() {
    this.rowHeight = window.innerHeight / 2;
    this.gridTop = this.grid.getBoundingClientRect().top;
    
    this.setRow();
    this.setQuadrant();
    this.setGrid();
  }

  setRowZindex() {
    for(let row = 0; row < this.gridElements.rows.length; row++) {
      this.gridElements.rows[row].style.zIndex = `${(row % 2 === 0) ? row * 5 : (row * 5) + 10}`;
    }
  }

  setRow() {
    for(let row = 0; row < this.gridElements.rows.length; row++) {
      this.gridElements.rows[row].style.height = `${this.rowHeight}px;`;
    } 
  }

  setQuadrant() {
    for(let quadrant = 0; quadrant < this.gridElements.quadrants.length; quadrant++) {
      this.gridElements.quadrants[quadrant].style.height = `${2 * this.rowHeight}px`; 
      this.gridElements.quadrants[quadrant].style.top = `${quadrant * -this.rowHeight}px`;
    }
  }

  setGrid() {
    const gridHeight = (this.rowHeight * (this.gridElements.quadrants.length + 1)); 
    this.grid.style.height = `${gridHeight}px`;
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  pageReload() {
    this.scrollToTop();
    window.location.reload();
  }

  requestTick() {
    if(this.scrollTick) {
            window.requestAnimationFrame(() => this.evaluate());
        }

        this.scrollTick = true;
    }

  evaluate() {
    this.resize();

    if (this.gridTop >= 0 || this.lastQuadrant.getBoundingClientRect().top <= 0) {
      this.clearClasses();
    } else {
      this.update();
    }

    this.scrollTick = false;
  }

  clearClasses() {
    for (let r = 0; r < this.gridElements.rows.length; r++) {
      
      if (this.lastQuadrant.getBoundingClientRect().top <= 0) {
        this.gridElements.rows[r].classList.remove(this.gridClasses.relative);
      } else {
        this.gridElements.rows[r].classList.add(this.gridClasses.relative); 
      }

      this.gridElements.rows[r].classList.remove(this.gridClasses.upper);
      this.gridElements.rows[r].classList.remove(this.gridClasses.lower);
    }
  }

  update() {

    for (let i = 0; i < this.gridElements.quadrants.length; i++) {

      if (this.gridTop <= i * -this.rowHeight && this.gridTop >= (i + 1) * -this.rowHeight) {
        
        // Rows determines how many rows are affected at each stage of the grid.   
        const rows = ((i * 2) + 4);

        for (let row = 0; row < rows; row++) {

          // Add/maintain fixed postioning to all other affected rows.
          if (row < rows - 2) {
            this.gridElements.rows[row].classList.remove(this.gridClasses.relative);

            if (row % 2 === 0) {
              this.gridElements.rows[row].classList.add(this.gridClasses.upper);
            } else {
              this.gridElements.rows[row].classList.add(this.gridClasses.lower);
            }
          }

          // Remove fixed positioning from the last two affected rows (reverting them to relative)
          else {
            this.gridElements.rows[row].classList.add(this.gridClasses.relative);

            if (row % 2 === 0) {
              this.gridElements.rows[row].classList.remove(this.gridClasses.upper);
            } else {
              this.gridElements.rows[row].classList.remove(this.gridClasses.lower);
            }
          }
        }
      } 
    }
  }

  listeners() {
    window.addEventListener('scroll', () => this.requestTick(), false);
    window.addEventListener('orientationchange', () => this.pageReload(), false);
    window.addEventListener('beforeunload', () => this.scrollToTop(), false);
    window.addEventListener('resize', () => this.resize(), false);
  }
}
