export default class StoryTeam {
  
  constructor() {
    this.elements = {
      window,
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0]
    }

    this.team = {
      container: document.querySelectorAll('#story-team')[0],
      panels: document.querySelectorAll('.c-team__panel'),
      rows: document.querySelectorAll('.c-team__row'),
      row:  'c-team__row',
      upper: 'c-team__row--upper', 
      lower: 'c-team__row--lower',
      fixed: 'c-team__row--fixed',
      relative: 'c-team__row--relative',
      row1: 'c-team__row--1',
      row2: 'c-team__row--2',
      row3: 'c-team__row--3',
      row4: 'c-team__row--4'
    }

    this.listeners();
  }


  listeners() {

    //window.alert('hi');

    this.elements.window.addEventListener('scroll', (e) => { 

      let last_known_scroll_position = 0;
      let ticking = false;
      let that = this;

      if (!ticking) {
        last_known_scroll_position = this.elements.window.scrollY;

        this.elements.window.requestAnimationFrame(() => { 
          that.fixedTopRows();
          ticking = false;
        })
      }

      ticking = true;
    });
  }


  fixedTopRows() { 

    const rowHeight = this.team.container.offsetHeight / this.team.rows.length; 
    const containerTop = this.team.container.getBoundingClientRect().top;
    
    //console.log(containerTop);

    for (let r = 0; r < this.team.rows.length; r++) {

      const row1 = this.team.rows[r];
      const row1Top = row1.getBoundingClientRect().top;


      if ( row1Top < 0 ) {

        const row2 = row1.nextSibling;
        const row3 = row2.nextSibling;
        const row4 = row3.nextSibling;

        row1.classList.add(this.team.fixed, this.team.upper);
        row2.classList.add(this.team.fixed, this.team.lower);

        row1.classList.remove(this.team.relative);
        row2.classList.remove(this.team.relative);
        
        row3.classList.add(this.team.relative);
        row4.classList.add(this.team.relative);
      }
    }
  }
}

