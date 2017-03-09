// 1. Fix the parallax container when it reaches the top of the page

// 2a. Calculate the height of each row in the parallax container
// 2b. As the user scrolls, subtract pixels from the height of the div

// 3. Once all content has been shown, return the parallax container to static positioning 

export default class Parallax {
  
  constructor() {
    this.elements = {
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0],
      window: window,
      parallax: document.querySelectorAll('#parallax')[0],
      fixed: 'u-fixedPos'
    }

    this.listeners();
  }

  listeners() {

    window.onscroll = () => {

      let paraRect = this.elements.parallax.getBoundingClientRect();

      if (paraRect.top === 0) {
        this.fixElement(this.elements.parallax);
        this.scrollLock(this.elements.html, true);
      }

    }
  }

  fixElement(elem) {
    if (!elem.classList.contains(this.elements.fixed)) {
      elem.classList.add(this.elements.fixed)
    }
  }

  scrollLock(elem, lock) {

    if(lock) {
      elem.style.overflowY = `hidden`;
    }
  }

}

//       let bodyRect = document.querySelectorAll('body')[0].getBoundingClientRect();

// }
  //   open() {
  //   this.active = true;
  //   this.elements.container.style.left = `${0}%`;
  //   this.elements.navigation.style.overflowY = `scroll`;
  //   this.elements.navigation.style.height = `100vh`;
  //   this.elements.html.style.overflowY = `hidden`;
  //   this.elements.body.style.overflowY = `hidden`;
  //   this.elements.container.classList.add(this.class);
  //   this.elements.hamburger.classList.add(this.class);
  // }

  // close() {
  //   this.active = false;
  //   this.elements.container.classList.remove(this.class);
  //   this.elements.hamburger.classList.remove(this.class);
  //   this.elements.navigation.style.overflowY = `inherit`;
  //   this.elements.navigation.style.height = `inherit`;

  //   setTimeout(() => {
  //     if(!this.active) {
  //       this.elements.container.style.left = `${100}%`;
  //       this.elements.html.style.overflowY = `auto`;
  //       this.elements.body.style.overflowY = `auto`;
  //     }
  //   }, this.speed);
  // }

  
