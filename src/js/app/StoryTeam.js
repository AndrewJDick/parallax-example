// 1. Fix the parallax container when it reaches the top of the page

// 2a. Calculate the height of each row in the parallax container
// 2b. As the user scrolls, subtract pixels from the height of the div

// 3. Once all content has been shown, return the parallax container to static positioning 

export default class StoryTeam {
  
  constructor() {
    this.elements = {
      window: window,
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0]
    }

    this.team = {
      container: document.querySelectorAll('#team-story')[0],
      panels: document.querySelectorAll('.c-team__panel'),
      row1: 'c-team__row--first',
      row2: 'c-team__row--second'
    }

    this.listeners();
  }


  listeners() {

    this.elements.window.addEventListener('scroll', (e) => { 

      let last_known_scroll_position = 0;
      let ticking = false;
      let that = this;

      if (!ticking) {
        last_known_scroll_position = this.elements.window.scrollY;

        this.elements.window.requestAnimationFrame(() => { 
          that.fixTopPanels();
          ticking = false;
        })
      }

      ticking = true;
    });
  }


  fixTopPanels() {
    
    for (let panel = 0; panel < this.team.panels.length; panel++) {

      const panel = this.team.panels[panel];
      const panelTop = panel.getBoundingClientRect().top;

      if (panelTop <= 0 && !panelTop.classList.contains(this.team.row1)) {
        panel.parentNode.classList.add(this.team.row1);
      }
    }
  }

    // var last_known_scroll_position = 0;
    // var ticking = false;
    // var self = this;
    
    // window.addEventListener('scroll', (e) => { 

    //   if (!ticking) {
    //     last_known_scroll_position = window.scrollY;

    //     window.requestAnimationFrame(() => {       
    //       if (this.elements.parallax.getBoundingClientRect().top <= 0) {
    //         this.elements.parallax.classList.add(this.elements.fixed);
    //         this.elements.parallax1.style.marginTop = '50vh';
    //         this.elements.parallax1.classList.add(this.elements.relative);
    //       }

    //       if (this.elements.parallax1.getBoundingClientRect().top <= 0) {
    //         this.elements.parallax.classList.remove(this.elements.fixed);
    //         this.elements.parallax1.style.marginTop = '0';
    //         this.elements.parallax1.classList.add(this.elements.fixed);
    //         this.elements.parallax1.classList.remove(this.elements.relative);
    //         this.elements.parallax2.style.marginTop = '50vh';
    //         this.elements.parallax2.classList.add(this.elements.relative);
    //       }

    //       ticking = false;
    //     });
    //   }
    //   ticking = true;
    // });
}

