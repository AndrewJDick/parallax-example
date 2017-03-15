export default class StoryTeam {
  
  constructor() {
    this.elements = {
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
      direction: false,
      ticking: false
    }

    this.init();
  }

  init() {
    this.team.quadrants.forEach( (quadrant, index) => {

      quadrant.setAttribute('pTop', 0);
      quadrant.setAttribute('cTop', 0);

      quadrant.setAttribute('pBot', 0);
      quadrant.setAttribute('cBot', 0);
    
    });

    this.listeners();
  }

  // TODO: Add Debounce to scroll event
  listeners() {
    window.addEventListener('scroll', () => this.onScroll(), false);
  }

  onScroll() {
    this.scroll.current = window.scrollY;
    
    this.scrollDirection();
    this.requestTick();

    this.scroll.previous = this.scroll.current;
  }

  scrollDirection() {
    (this.scroll.current > this.scroll.previous) 
      ? this.scroll.direction = true    // Scroll Down
      : this.scroll.direction = false;  // Scroll Up
  }

  requestTick() {
    if(!this.scroll.ticking) {
      window.requestAnimationFrame(() => this.gridOverlap());
    }
    this.scroll.ticking = true;
  }

  gridOverlap() { 

    this.scroll.ticking = false;

    //if (this.team.container.getBoundingClientRect().top <= 0) {

      this.team.quadrants.forEach( (quadrant, index) => {

        const currentTop = quadrant.getBoundingClientRect().top;
        const currentBot = quadrant.getBoundingClientRect().bottom;
        const vpHeight   = window.innerHeight;

        // User is scrolling down and the quadrant crosses the top of the viewport
        if (currentTop <= 0 && currentBot > 0 && this.scroll.direction) {

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

        // User is scrolling up and the quadrant crosses the bottom of the viewport
        if (currentBot >= vpHeight && currentTop < vpHeight && !this.scroll.direction) {

          quadrant.firstChild.classList.add(this.team.upper);
          quadrant.lastChild.classList.add(this.team.lower);

          quadrant.firstChild.classList.remove(this.team.relative);
          quadrant.lastChild.classList.remove(this.team.relative);

          quadrant.firstChild.style.zIndex = 15;
          quadrant.lastChild.style.zIndex = 5;

          if (quadrant.nextSibling) {

            quadrant.nextSibling.firstChild.classList.remove(this.team.upper);
            quadrant.nextSibling.lastChild.classList.remove(this.team.lower);

            quadrant.nextSibling.firstChild.classList.add(this.team.relative);
            quadrant.nextSibling.lastChild.classList.add(this.team.relative);

            quadrant.nextSibling.firstChild.style.zIndex = 20;
            quadrant.nextSibling.lastChild.style.zIndex = 10;
          }

          if (quadrant.previousSibling) {

            quadrant.previousSibling.firstChild.classList.remove(this.team.upper);
            quadrant.previousSibling.lastChild.classList.remove(this.team.lower);

            quadrant.previousSibling.firstChild.classList.add(this.team.relative);
            quadrant.previousSibling.lastChild.classList.add(this.team.relative);

            quadrant.previousSibling.firstChild.style.zIndex = 20;
            quadrant.previousSibling.lastChild.style.zIndex = 10;
          } else {
            this.clearClasses();
          }
        }
      });
    //}
  }

  clearClasses() {
    this.team.rows.forEach((row, index) => {
      row.setAttribute('class', `${this.team.row} ${this.team.row}--${index + 1}`);
    });
  }
}

