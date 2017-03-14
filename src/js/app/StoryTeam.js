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
      relative: 'c-team__row--relative'
    }

    this.scroll = {
      previous: 0,
      current: 0,
      direction: false
    }

    this.init();
  }

  init() {
    this.team.quadrants.forEach( (quadrant, index) => {

      quadrant.setAttribute('pTop', 0);
      quadrant.setAttribute('cTop', 0);
    
    });

    this.listeners();
  }


  // TODO: Add Debounce to scroll event
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


  clearClasses() {
    this.team.rows.forEach((row, index) => {
      row.setAttribute('class', `${this.team.row} ${this.team.row}--${index + 1}`);
    });
  }


  gridOverlap() { 

    this.team.quadrants.forEach( (quadrant, index) => {

      quadrant.setAttribute('cTop', quadrant.getBoundingClientRect().top);

      let currentTop = quadrant.getAttribute('cTop');
      let previousTop = quadrant.getAttribute('pTop');

      if (previousTop > 0 && currentTop < 0 && this.scroll.direction) {

        console.log('bang');

        quadrant.firstChild.classList.add(this.team.upper);
        quadrant.lastChild.classList.add(this.team.lower);

        quadrant.firstChild.classList.remove(this.team.relative);
        quadrant.lastChild.classList.remove(this.team.relative);

        quadrant.firstChild.style.zIndex = 5;
        quadrant.lastChild.style.zIndex = 15;

        if (quadrant.previousSibling) {

          quadrant.previousSibling.firstChild.classList.remove(this.team.upper);
          quadrant.previousSibling.lastChild.classList.remove(this.team.lower);

          quadrant.previousSibling.firstChild.classList.add(this.team.relative);
          quadrant.previousSibling.lastChild.classList.add(this.team.relative);

          quadrant.previousSibling.firstChild.style.zIndex = 10;
          quadrant.previousSibling.lastChild.style.zIndex = 20;
        } 
        
        if (quadrant.nextSibling) {
    
          quadrant.firstChild.classList.remove(this.team.relative);
          quadrant.lastChild.classList.remove(this.team.relative);

          quadrant.nextSibling.firstChild.classList.add(this.team.relative);
          quadrant.nextSibling.lastChild.classList.add(this.team.relative);

          quadrant.nextSibling.firstChild.style.zIndex = 10;
          quadrant.nextSibling.lastChild.style.zIndex = 20;
        } else {
          this.clearClasses();
        }
      }

      quadrant.setAttribute('pTop', currentTop);

    //   // if (this.isVisible1(quadrant) && this.scroll.direction) {

    //   //   quadrant.firstChild.classList.add(this.team.upper);
    //   //   quadrant.lastChild.classList.add(this.team.lower);

    //   //   quadrant.firstChild.classList.remove(this.team.relative);
    //   //   quadrant.lastChild.classList.remove(this.team.relative);

    //   //   quadrant.firstChild.style.zIndex = 5;
    //   //   quadrant.lastChild.style.zIndex = 15;

    //   //   if (quadrant.previousSibling) {

    //   //     quadrant.previousSibling.firstChild.classList.remove(this.team.upper);
    //   //     quadrant.previousSibling.lastChild.classList.remove(this.team.lower);

    //   //     quadrant.previousSibling.firstChild.classList.add(this.team.relative);
    //   //     quadrant.previousSibling.lastChild.classList.add(this.team.relative);

    //   //     quadrant.previousSibling.firstChild.style.zIndex = 10;
    //   //     quadrant.previousSibling.lastChild.style.zIndex = 20;
    //   //   } 
        
    //   //   if (quadrant.nextSibling) {
    
    //   //     quadrant.firstChild.classList.remove(this.team.relative);
    //   //     quadrant.lastChild.classList.remove(this.team.relative);

    //   //     quadrant.nextSibling.firstChild.classList.add(this.team.relative);
    //   //     quadrant.nextSibling.lastChild.classList.add(this.team.relative);

    //   //     quadrant.nextSibling.firstChild.style.zIndex = 10;
    //   //     quadrant.nextSibling.lastChild.style.zIndex = 20;
    //   //   } else {
    //   //     this.clearClasses();
    //   //   }
    //   // }

    //   // if (this.isVisible(quadrant) && !this.scroll.direction) {
        
    //   //   quadrant.firstChild.classList.add(this.team.upper);
    //   //   quadrant.lastChild.classList.add(this.team.lower);

    //   //   quadrant.firstChild.classList.remove(this.team.relative);
    //   //   quadrant.lastChild.classList.remove(this.team.relative);

    //   //   quadrant.firstChild.style.zIndex = 15;
    //   //   quadrant.lastChild.style.zIndex = 5;

    //   //   if (quadrant.nextSibling) {

    //   //     quadrant.nextSibling.firstChild.classList.remove(this.team.upper);
    //   //     quadrant.nextSibling.lastChild.classList.remove(this.team.lower);

    //   //     quadrant.nextSibling.firstChild.classList.add(this.team.relative);
    //   //     quadrant.nextSibling.lastChild.classList.add(this.team.relative);

    //   //     quadrant.nextSibling.firstChild.style.zIndex = 20;
    //   //     quadrant.nextSibling.lastChild.style.zIndex = 10;
    //   //   }

    //   //   if (quadrant.previousSibling) {

    //   //     quadrant.previousSibling.firstChild.classList.remove(this.team.upper);
    //   //     quadrant.previousSibling.lastChild.classList.remove(this.team.lower);

    //   //     quadrant.previousSibling.firstChild.classList.add(this.team.relative);
    //   //     quadrant.previousSibling.lastChild.classList.add(this.team.relative);

    //   //     quadrant.previousSibling.firstChild.style.zIndex = 20;
    //   //     quadrant.previousSibling.lastChild.style.zIndex = 10;
    //   //   } else {
    //   //     this.clearClasses();
    //   //   }
    //   // }

    });
  }

  isVisible(element) {
    const elemTop = element.getBoundingClientRect().top;

    const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
  }
}

