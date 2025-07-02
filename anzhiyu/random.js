var posts=["posts/4d01862e/","posts/7517973c/","posts/be811694/","posts/1319af8/","posts/56e727f8/","posts/8690e815/","posts/955af619/","posts/31000275/","posts/4a17b156/","posts/560d7f1/","posts/560d8f6/","posts/560d8f5/","posts/80034969/","posts/ac56d399/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };