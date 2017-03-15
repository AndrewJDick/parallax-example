export default function storyPeople() {

  const scrollAttr = {
    previous: 0,
    current: 0,
    direction: false,
    ticking: false
  };

  function listeners() {
    window.addEventListener('scroll', () => onScroll(), false);
  }

  function onScroll() {
    scrollAttr.current = window.scrollY;
    
    scrollDirection();
    requestTick();

    scrollAttr.previous = scrollAttr.current;
  }

  function scrollDirection() {
    (scrollAttr.current > scrollAttr.previous) 
      ? scrollAttr.direction = true    // Scroll Down
      : scrollAttr.direction = false;  // Scroll Up
  }

  function requestTick() {
    if(!scrollAttr.ticking) {
      window.requestAnimationFrame(() => update());
    }
    scrollAttr.ticking = true;
  }

  function update() { 

    scrollAttr.ticking = false;

    const peopleContainer = document.querySelectorAll('#story-people')[0];

    if (peopleContainer.getBoundingClientRect().top <= 0 || peopleContainer.getBoundingClientRect().bottom > 0 ) {

      const viewportHeight = window.innerHeight;

      const gridElements = {
        quadrants: document.querySelectorAll('.c-team__quadrant'),
        rows: document.querySelectorAll('.c-team__row')
      };

      const teamClasses = { 
        row:  'c-team__row',
        upper: 'c-team__row--upper', 
        lower: 'c-team__row--lower',
        relative: 'c-team__row--relative'
      };

      gridElements.quadrants.forEach( (quadrant) => {

        quadrant.setAttribute('cT', quadrant.getBoundingClientRect().top);
        quadrant.setAttribute('cB', quadrant.getBoundingClientRect().bottom);

        const currentTop = quadrant.getAttribute('cT');
        const currentBot = quadrant.getAttribute('cB');

        const previousTop = quadrant.getAttribute('pT');
        const previousBot = quadrant.getAttribute('pB');


        // Scroll down
        if (previousTop > 0 && currentTop <= 0 && scrollAttr.direction) {

          configureQuadrant(quadrant, teamClasses.upper, teamClasses.relative, teamClasses.lower, teamClasses.relative, 5, 15);

          (quadrant.nextSibling)
            ? configureQuadrant(quadrant.nextSibling, teamClasses.relative, teamClasses.upper, teamClasses.relative, teamClasses.lower, 10, 20)
            : clearClasses(gridElements.rows, teamClasses);

          if (quadrant.previousSibling) {
            configureQuadrant(quadrant.previousSibling, teamClasses.relative, teamClasses.upper, teamClasses.relative, teamClasses.lower, 10, 20);
          } 
        }

        // Scroll Up
        if (previousBot < viewportHeight && currentBot >= viewportHeight && !scrollAttr.direction) {

          configureQuadrant(quadrant, teamClasses.upper, teamClasses.relative, teamClasses.lower, teamClasses.relative, 15, 5);

          if (quadrant.nextSibling) {
            configureQuadrant(quadrant.nextSibling, teamClasses.relative, teamClasses.upper, teamClasses.relative, teamClasses.lower, 20, 10);
          }

          (quadrant.previousSibling)
            ? configureQuadrant(quadrant.previousSibling, teamClasses.relative, teamClasses.upper, teamClasses.relative, teamClasses.lower, 20, 10)
            : clearClasses(gridElements.rows, teamClasses);
        }

        quadrant.setAttribute('pT', currentTop);
        quadrant.setAttribute('pB', currentBot);
      });
    }
  }

  function configureQuadrant(quad, class1, class2, class3, class4, z1, z2) {
    
    quad.firstChild.classList.add(class1);
    quad.firstChild.classList.remove(class2);
    quad.firstChild.style.zIndex = z1;

    quad.lastChild.classList.add(class3);
    quad.lastChild.classList.remove(class4);
    quad.lastChild.style.zIndex = z2;

  }

  function clearClasses(rows, classes) {

    rows.forEach((row, index) => {
      row.classList.remove(classes.upper);
      row.classList.remove(classes.lower);
      row.classList.remove(classes.relative);
    });
  }

  // Weeeeeeeeeeee!
  listeners();
}
