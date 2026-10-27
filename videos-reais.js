(()=>{
  const videos=[...document.querySelectorAll('video[data-real-preview],video[data-real-film]')];
  const visible=new Set();
  function load(video){
    if(video.dataset.loaded)return;
    video.querySelectorAll('source[data-src]').forEach(source=>{source.src=source.dataset.src;});
    video.dataset.loaded='true';video.load();
  }
  function play(video){const result=video.play();if(result)result.catch(()=>{});}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const video=entry.target;
    if(entry.isIntersecting){visible.add(video);load(video);if(video.hasAttribute('data-real-preview')&&!document.hidden)play(video);}
    else{visible.delete(video);if(video.hasAttribute('data-real-preview'))video.pause();}
  }),{threshold:.2});
  videos.forEach(video=>{video.muted=true;observer.observe(video);});
  document.addEventListener('visibilitychange',()=>videos.forEach(video=>{
    if(document.hidden)video.pause();
    else if(visible.has(video)&&video.hasAttribute('data-real-preview'))play(video);
  }));
})();
