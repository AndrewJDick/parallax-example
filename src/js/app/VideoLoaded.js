export default class VideoLoaded {

  constructor(videoId) {
    this.video = document.getElementById(videoId);
    this.hidden = 'u-hidden';

    this.listeners();
  }

  listeners() {
    this.video.addEventListener('loadeddata', this.showVideo(), false); 
  }
  
  showVideo() { 
    
    const video = this.video;
    const hidden = this.hidden;

    video.classList.remove(hidden);
  }

}
