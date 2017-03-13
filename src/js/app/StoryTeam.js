export default class StoryTeam {
  
  constructor() {
    this.elements = {
      window: window,
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

    this.active = true,

    this.listeners();
  }


  listeners() {

    //window.alert('hi');

    this.elements.window.addEventListener('scroll', (e) => { 

      const containerTop = this.team.container.getBoundingClientRect().top;
      const containerBot = this.team.container.getBoundingClientRect().bottom;
      const windowBot = window.innerHeight;
      const lastRowBot = this.team.rows[this.team.rows.length-1].getBoundingClientRect().bottom;


      console.log(`container bot = ${containerBot}`);

      if (containerTop < 0 && this.active === true) {
        this.fixedTopRows();
      }

      if (lastRowBot < windowBot && this.active === true) {
        this.clearClasses(containerBot);
      }
    });
  }


  fixedTopRows() { 

    const rowHeight = this.team.container.offsetHeight / this.team.rows.length; 
    
    
    //console.log(containerTop);

    for (let r = 0; r < this.team.rows.length; r++) {

      const row1 = this.team.rows[r];
      const row1Top = row1.getBoundingClientRect().top;



      if ( row1Top < 0) {

        const row2 = row1.nextSibling;

        row1.classList.add(this.team.fixed, this.team.upper);
        row2.classList.add(this.team.fixed, this.team.lower);

        row1.classList.remove(this.team.relative);
        row2.classList.remove(this.team.relative);

        if (r <= 3) {
          const row3 = row2.nextSibling;
          const row4 = row3.nextSibling;

          row3.classList.add(this.team.relative);
          row4.classList.add(this.team.relative);
        }
      }
    }
  }

  clearClasses(containerBot) {

    this.active = false;
    
    for (let r = 0; r < this.team.rows.length; r++) {
      this.team.rows[r].setAttribute('class', this.team.row)
    }
  }
}

