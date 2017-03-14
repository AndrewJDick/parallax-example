export default class StoryTeam {
  
  constructor() {
    this.elements = {
      window: window,
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0]
    }

    this.team = {
      container: document.querySelectorAll('#story-team')[0],
      quadrants: document.querySelectorAll('.c-team__quadrant'),
      rows: document.querySelectorAll('.c-team__row'),
      row:  'c-team__row',
      upper: 'c-team__row--upper', 
      lower: 'c-team__row--lower',
      fixed: 'c-team__row--fixed',
      relative: 'c-team__row--relative'
    }

    this.scroll = {
      previous: 0,
      current: 0,
      direction: false
    }

    this.listeners();
  }


  listeners() {

    this.elements.window.addEventListener('scroll', (e) => { 

      this.scroll.current = this.elements.window.pageYOffset;

      this.scrollDirection(this.scroll.previous, this.scroll.current);

      this.scroll.previous = this.scroll.current;
    });
  }


  scrollDirection(previous, current) {

    (current > previous) 
      ? this.scroll.direction = true
      : this.scroll.direction = false;

    this.gridOverlap();
  }


  gridOverlap() { 

    (this.scroll.direction) ? console.log('scrollDown') : console.log('scrollUp');

    // this.team.quadrants.forEach( (quadrant, index) => {

    //   if (this.isVisible(quadrant) && scrollDirection) {
        
    //     quadrant.firstChild.classList.add(this.team.upper);
    //     quadrant.lastChild.classList.add(this.team.lower);

    //     quadrant.nextSibling.firstChild.classList.add(this.team.relative);
    //     quadrant.nextSibling.lastChild.classList.add(this.team.relative);
    //   }

    // });

      // this.team.rows.forEach( (row, index) => {
      //   const lastRow = this.team.container.lastChild.getBoundingClientRect().bottom;
      //   const viewportHeight = this.elements.window.innerHeight;
      //   const row1 = row;

      //   let row2, row3, row4, rowNeg1, rowNeg2;

      // Fix a row to the browser window once it hits the top of the page
      // if ( row1.getBoundingClientRect().top < 0 && lastRow > window.innerHeight) {

      //   if (row1.previousSibling) {
      //     rowNeg1 = row1.previousSibling;
      //     rowNeg2 = rowNeg1.previousSibling;

      //     rowNeg1.classList.add(this.team.relative);
      //     rowNeg2.classList.add(this.team.relative);

      //     rowNeg1.classList.remove(this.team.lower);
      //     rowNeg2.classList.remove(this.team.upper);
      //   }

      //   if (row1.nextSibling) {
      //     row2 = row1.nextSibling;

      //     row1.classList.add(this.team.upper);
      //     row2.classList.add(this.team.lower);

      //     row1.classList.remove(this.team.relative);
      //     row2.classList.remove(this.team.relative);
      //   }

      //   if (row2.nextSibling) {
      //     row3 = row2.nextSibling;
      //     row4 = row3.nextSibling;

      //     row3.classList.add(this.team.relative);
      //     row4.classList.add(this.team.relative);
      //   }
      // } 

      // if (lastRow < window.innerHeight) {
      //   this.clearClasses();
      // }
      // });
  }

  isVisible(element) {
    const elemTop = element.getBoundingClientRect().top;
    const elemBottom = element.getBoundingClientRect().bottom;

    const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
  }

  scrollUp() {
    
    // const reverseRows = [].slice.call(this.team.rows).reverse();

    // reverseRows.forEach( (row, index) => {
    //   const lastRow = this.team.container.lastChild.getBoundingClientRect().bottom;
    //   const row4 = row;

    //   let row3, row2, row1;

    //   row.classList.add(`c-team__row--${index + 1}`);


    //   if ( row4.getBoundingClientRect().bottom > window.innerHeight) {
    //     console.log('bang');

    //     if (row4.previousSibling) {
    //       row3 = row4.previousSibling;

    //       row3.classList.add(this.team.upper);
    //       row4.classList.add(this.team.lower);

    //       row3.classList.remove(this.team.relative, 'final');
    //       row4.classList.remove(this.team.relative, 'final');
    //     }

    //     if (row3.previousSibling) {
    //       row2 = row3.previousSibling;
    //       row1 = row2.previousSibling;

    //       row2.classList.add(this.team.relative, 'final');
    //       row1.classList.add(this.team.relative, 'final');
    //     }
    //   }


    // });
  }

  clearClasses() {
    this.team.rows.forEach((row) => {
      row.setAttribute('class', `${this.team.row} final`);
    });
  }

  // injectPlaceholder(row) {

  //   const element = this.team.container;
  //   const fragment = document.createDocumentFragment();

  //   var div = document.createElement('div');
  //   div.style.height = '50vh';
  //   div.setAttribute('class', 'js-placeholder');
  //   fragment.appendChild(div);

  //   element.insertBefore(fragment, row);

  // }

  // removePlaceholders() {

  //   const placeholders = document.getElementsByClassName('js-placeholder');
    
  //   for (let p = 0; p < placeholders.length; p++) {
  //     placeholders[p].parentNode.removeChild(placeholders[p]);
  //   }
  // }
}

