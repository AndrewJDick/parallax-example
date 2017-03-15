export default class StoryTeam {
  
  constructor() {

    this.Elements = {
      quadrants: document.querySelectorAll('.c-team__quadrant'),
      rows: document.querySelectorAll('.c-team__row')
    };

    this.scroll = {
      previous: 0,
      current: 0,
      direction: false,
      ticking: false
    };

    this.listeners();
  }

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
      window.requestAnimationFrame(() => this.update());
    }
    this.scroll.ticking = true;
  }

  update() { 

    this.scroll.ticking = false;

    const peopleContainer = document.querySelectorAll('#story-team')[0];

    if (peopleContainer.getBoundingClientRect().top <= 0 || peopleContainer.getBoundingClientRect().bottom > 0 ) {

      const viewportHeight = window.innerHeight;

      const teamClasses = { 
        row:  'c-team__row',
        upper: 'c-team__row--upper', 
        lower: 'c-team__row--lower',
        relative: 'c-team__row--relative'
      };

      this.Elements.quadrants.forEach( (quadrant) => {

        quadrant.setAttribute('cT', quadrant.getBoundingClientRect().top);
        quadrant.setAttribute('cB', quadrant.getBoundingClientRect().bottom);

        const currentTop = quadrant.getAttribute('cT');
        const currentBot = quadrant.getAttribute('cB');

        const previousTop = quadrant.getAttribute('pT');
        const previousBot = quadrant.getAttribute('pB');


        // Scroll down
        if (previousTop > 0 && currentTop <= 0 && this.scroll.direction) {

          quadrant.firstChild.classList.add(teamClasses.upper);
          quadrant.lastChild.classList.add(teamClasses.lower);

          quadrant.firstChild.classList.remove(teamClasses.relative);
          quadrant.lastChild.classList.remove(teamClasses.relative);

          quadrant.firstChild.style.zIndex = 5;
          quadrant.lastChild.style.zIndex = 15;

          if (quadrant.previousSibling) {

            quadrant.previousSibling.firstChild.classList.remove(teamClasses.upper);
            quadrant.previousSibling.lastChild.classList.remove(teamClasses.lower);

            quadrant.previousSibling.firstChild.classList.add(teamClasses.relative);
            quadrant.previousSibling.lastChild.classList.add(teamClasses.relative);

            quadrant.previousSibling.firstChild.style.zIndex = 10;
            quadrant.previousSibling.lastChild.style.zIndex = 20;
          } 
          
          if (quadrant.nextSibling) {
      
            quadrant.firstChild.classList.remove(teamClasses.relative);
            quadrant.lastChild.classList.remove(teamClasses.relative);

            quadrant.nextSibling.firstChild.classList.add(teamClasses.relative);
            quadrant.nextSibling.lastChild.classList.add(teamClasses.relative);

            quadrant.nextSibling.firstChild.style.zIndex = 10;
            quadrant.nextSibling.lastChild.style.zIndex = 20;
          } else {
            this.clearClasses(this.Elements.rows, teamClasses);
          }
        }

        // Scroll Up
        if (previousBot < viewportHeight && currentBot >= viewportHeight && !this.scroll.direction) {

          quadrant.firstChild.classList.add(teamClasses.upper);
          quadrant.lastChild.classList.add(teamClasses.lower);

          quadrant.firstChild.classList.remove(teamClasses.relative);
          quadrant.lastChild.classList.remove(teamClasses.relative);

          quadrant.firstChild.style.zIndex = 15;
          quadrant.lastChild.style.zIndex = 5;

          if (quadrant.nextSibling) {

            quadrant.nextSibling.firstChild.classList.remove(teamClasses.upper);
            quadrant.nextSibling.lastChild.classList.remove(teamClasses.lower);

            quadrant.nextSibling.firstChild.classList.add(teamClasses.relative);
            quadrant.nextSibling.lastChild.classList.add(teamClasses.relative);

            quadrant.nextSibling.firstChild.style.zIndex = 20;
            quadrant.nextSibling.lastChild.style.zIndex = 10;
          }

          if (quadrant.previousSibling) {

            quadrant.previousSibling.firstChild.classList.remove(teamClasses.upper);
            quadrant.previousSibling.lastChild.classList.remove(teamClasses.lower);

            quadrant.previousSibling.firstChild.classList.add(teamClasses.relative);
            quadrant.previousSibling.lastChild.classList.add(teamClasses.relative);

            quadrant.previousSibling.firstChild.style.zIndex = 20;
            quadrant.previousSibling.lastChild.style.zIndex = 10;
          } else {
            this.clearClasses(this.Elements.rows, teamClasses);
          }
        }

        quadrant.setAttribute('pT', currentTop);
        quadrant.setAttribute('pB', currentBot);
      });
    }
  }

  clearClasses(rows, classes) {

    rows.forEach((row, index) => {
      row.classList.remove(classes.upper);
      row.classList.remove(classes.lower);
      row.classList.remove(classes.relative);
    });
  }
}

