// 1. Fix the parallax container when it reaches the top of the page

// 2a. Calculate the height of each row in the parallax container
// 2b. As the user scrolls, subtract pixels from the height of the div

// 3. Once all content has been shown, return the parallax container to static positioning 

export default class Parallax {
  
  constructor() {
    this.elements = {
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0],
      parallax: document.querySelectorAll('#parallax')[0],
      parallax1: document.querySelectorAll('#parallax-1')[0],
      fixed: 'u-fixed',
      active: false,
    }

    this.listeners();
  }

  listeners() {

    var last_known_scroll_position = 0;
    var ticking = false;
    var self = this;
    
    window.addEventListener('scroll', (e) => { 

      if (!ticking) {
        last_known_scroll_position = window.scrollY;

        window.requestAnimationFrame(() => {       
          if (this.elements.parallax.getBoundingClientRect().top <= 0) {
            this.elements.parallax.classList.add(this.elements.fixed);
            this.elements.parallax1.style.marginTop = '50vh';
          }
          ticking = false;
        });
      }
      ticking = true;
    });
  }
}

