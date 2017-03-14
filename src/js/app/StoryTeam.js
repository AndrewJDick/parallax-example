export default class StoryTeam {
  
  constructor() {
    this.elements = {
      window: window,
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0]
    }

    this.team = {
      container: document.querySelectorAll('#story-team')[0],
      rows: document.querySelectorAll('.c-team__row'),
      row:  'c-team__row',
      upper: 'c-team__row--upper', 
      lower: 'c-team__row--lower',
      fixed: 'c-team__row--fixed',
      relative: 'c-team__row--relative'
    }

    this.listeners();
  }


  listeners() {

    let previousScrollPosition = 0;

    this.elements.window.addEventListener('scroll', (e) => { 

      const currentScrollPosition = this.elements.window.pageYOffset;

      (currentScrollPosition > previousScrollPosition)
        ? this.scrollDown()
        : this.scrollUp();

      previousScrollPosition = currentScrollPosition;
    });
  }


  scrollDown() { 

    this.team.rows.forEach( (row) => {
      const lastRow = this.team.container.lastChild.getBoundingClientRect().bottom;
      const viewportHeight = this.elements.window.innerHeight;
      const row1 = row;

      let row2, row3, row4;

      // Fix a row to the browser window once it hits the top of the page
      if ( row1.getBoundingClientRect().top < 0 && lastRow > window.innerHeight) {

        if (row1.nextSibling) {
          row2 = row1.nextSibling;

          row1.classList.add(this.team.upper);
          row2.classList.add(this.team.lower);

          row1.classList.remove(this.team.relative);
          row2.classList.remove(this.team.relative);
        }

        if (row2.nextSibling) {
          row3 = row2.nextSibling;
          row4 = row3.nextSibling;

          row3.classList.add(this.team.relative);
          row4.classList.add(this.team.relative);
        }
      } 

      if (lastRow < window.innerHeight) {
        this.clearClasses();
      }
    });
  }

  scrollUp() {
    console.log('scroll up');
  }

  clearClasses() {
    this.team.rows.forEach((row) => {
      row.setAttribute('class', `${this.team.row} final`);
    });
  }

  injectPlaceholder(row) {

    const element = this.team.container;
    const fragment = document.createDocumentFragment();

    var div = document.createElement('div');
    div.style.height = '50vh';
    div.setAttribute('class', 'js-placeholder');
    fragment.appendChild(div);

    element.insertBefore(fragment, row);

  }

  removePlaceholders() {

    const placeholders = document.getElementsByClassName('js-placeholder');
    
    for (let p = 0; p < placeholders.length; p++) {
      placeholders[p].parentNode.removeChild(placeholders[p]);
    }
  }
}

