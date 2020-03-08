class Injector {

  private ipcRenderer: any;
  private remote: any;
  private video!: HTMLVideoElement;

  constructor() {
    let electron = null;
    try {
      electron = window.require('electron');
    } catch (e) {
      electron = (window.module as any).require('electron');
    }
    if (!electron) {
      return;
    }


    const {ipcRenderer, remote} = electron;

    //let a = module.require('electron')
    this.ipcRenderer = ipcRenderer;
    this.remote = remote;

    this.loopToGetDuration();
    this.listen();
  }

  async listen() {

    this.ipcRenderer.on('play-video', (event: any, data: any) => {

      if (!this.video) {

        return;
      }
      console.log('play-video', event, data);
      if (data) {
        this.video.currentTime = data.duration;
        this.video.play();

      } else {
        this.video.play();

      }
    });
    this.ipcRenderer.on('pause-video', () => {
      console.log('listen pause');
      if (!this.video) {
        return;
      }
      this.video.pause();
    });

    this.ipcRenderer.on('request-get-video-length',()=>{

      if(!this.video){
        return;
      }
      //视频总长度
      let duration = this.video.duration;
      this.ipcRenderer.sendToHost('video-length',duration);
    });
  }

  private sendDuration(duration: number) {

    this.ipcRenderer.sendToHost('duration', duration);
  }

  async loopToGetDuration() {


    this.video = this.findVideo();

    while (true) {

      if (!this.video) {
        this.video = this.findVideo();
        await this.sleep(500);
        continue;
      }
      let duration: number = parseInt(this.video.currentTime.toFixed(0));
      // console.log(duration);
      this.sendDuration(duration);
      await this.sleep(500);
    }
  }

  private findVideo(): any {

    let href = location.href;
    if (href.indexOf('pan.baidu.com/play/video') > 0) {//是百度云播放页面

      console.log('是在百度云播放页延时1秒再查找');


      let videoRoot = document.querySelector('#video-root');
      if (!videoRoot) {
        return null;
      }
      let shadow = videoRoot.shadowRoot;
      if (!shadow) {
        return null;
      }
      let target = shadow.querySelector('video');
      if (target) {
        console.log('已找到');
        this.baiduStyle(shadow);
        return target;
      } else {
        return null;
      }

    } else {

      let videos = document.getElementsByTagName('video');
      if (!videos || videos.length == 0) {
        return null;
      }
      let video: HTMLVideoElement = videos[0];
      return video;
    }
  }


  private editWidthStyle(selector:string,width:string){
    let e: HTMLElement = document.querySelector(selector) as HTMLElement;
    if(e){
      e.style.width = width;
    }else{
      console.log(`editWidthStyle() ${selector} 样式没有找到对应的element`);
    }
  }

  private editminWidthStyle(selector:string,minWidth:string){
    let e: HTMLElement = document.querySelector(selector) as HTMLElement;
    if(e){
      e.style.minWidth = minWidth;
    }else{
      console.log(`editminWidthStyle() ${selector} 样式没有找到对应的element`);
    }
  }



  private editDisplayStyle(selector:string,display:string){
    let e: HTMLElement = document.querySelector(selector) as HTMLElement;
    if(e){
      e.style.display = display;
    }else{
      console.log(`editDisplayStyle() ${selector} 样式没有找到对应的element`);
    }
  }

  private async baiduStyle(shadow: any) {

    await this.sleep(2000);

    let e: HTMLElement = document.querySelector('video-main') as HTMLElement;
    if (e) {
      e.style.width = '100%;';
    }
    this.editWidthStyle('div.video-main','100%');
    this.editWidthStyle('span.video-title-left','100%');
    this.editDisplayStyle('div.other-video-box','none');
    this.editDisplayStyle('#video-toolbar','none');
    this.editDisplayStyle('div.dis-footer','none');
    this.editDisplayStyle('dd.vyQHNyb','none');
    this.editDisplayStyle('dt.EHazOI','none');
    this.editminWidthStyle('dl.xtJbHcb','0px');


    e = shadow.querySelector('#video-player') as HTMLElement;
    if (e)
      e.style.width = '100%';

  }

  sleep(time: number): Promise<void> {

    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}

const injector = new Injector();
