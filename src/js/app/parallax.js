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
      parallaxRow: document.querySelectorAll('.parallax__row')[0],
      fixed: 'u-fixed',
      active: false
    }

    this.activate();
  }

  activate() {
    
    this.active = true;
    this.elements.parallax.classList.add(this.elements.fixed);
    this.elements.html.style.overflowY = 'hidden';

    // Group all parallax rows in an array 
    // const parallaxRows = document.getElementsByClassName("c-parallax__row");

    // for (let row = 0; row < parallaxRows.length; row++) {
      
    //   const rowHeight = $(parallaxRows[row]).height();

    //   const panelImages = parallaxRows[row].getElementsByClassName("c-parallax__img");

    //   console.log(panelImages);

    //   // for (let img = 0; img < panelImages.length; row++) {
        
    //   //   console.log(rowHeight);
    //   //   // const imgHeight = rowHeight / panelImages.length;
    //   //   // panelImages[img].style.height = imgHeight;
    //   // }
    // }
  }
  // listeners() {

  //   window.onscroll = () => {

  //     let parallaxRect = this.elements.parallax.getBoundingClientRect();

  //     parallaxRect.top <= 0
  //       ? this.active() 
  //       : this.disable();

  //   }
  // }

}
  
