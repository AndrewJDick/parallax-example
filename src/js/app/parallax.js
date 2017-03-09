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
    const parallaxRows = this.elements.parallax.getElementsByClassName('c-parallax__row');
    console.log(parallaxRows);

    for (let row = 0; row < parallaxRows.length; row++) {
      
      // For each row, find the panel quadrant and retrieve it's rendered height;
      const panelQuadrant = parallaxRows[row].getElementsByClassName('js-panel-quadrant');
      const $rowHeight = $(panelQuadrant).height();

      // Assign the height amongst each of the row's images
      const rowImages = parallaxRows[row].getElementsByClassName('c-parallax__imgQuadrant__img');
      const imgHeight = $rowHeight / rowImages.length;

      for (let img = 0; img < rowImages.length; img++) {
        rowImages[img].style.height = `${imgHeight}px`;
      }
    }

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
  
