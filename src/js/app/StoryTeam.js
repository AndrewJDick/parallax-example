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
      relative: 'c-team__row--relative'
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
    
    for (let r = 0; r < this.team.rows.length; r++) {

      const row = this.team.rows[r];
      const rowTop = row.getBoundingClientRect().top;

      if ( -rowHeight < rowTop && rowTop < 0 ) {

        row.classList.add(this.team.upper);
        row.nextSibling.classList.add(this.team.lower);
        
        row.classList.remove(this.team.relative);
        row.nextSibling.classList.remove(this.team.relative);

      }
    }
  }
}

