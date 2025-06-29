document.addEventListener('DOMContentLoaded', function() {
  // 只在首页添加自定义元素
  if (document.body.classList.contains('index')) {
    const postList = document.getElementById('recent-posts');
    
    if (postList) {
      // 创建个人资料卡片
      const profileCard = document.createElement('div');
      profileCard.className = 'profile-card';
      profileCard.innerHTML = `
        <div class="profile-card-left">
          <img src="/img/butterfly-icon.png" class="profile-avatar" />
          <div class="profile-name">你好，很高兴认识你 👋</div>
          <div class="profile-title">我叫 Younger</div>
          <div class="profile-description">是一名充满热情的技术爱好者、博主</div>
        </div>
        <div class="profile-card-right">
          <div class="profile-tags">
            <div class="profile-tag"><i class="fas fa-laptop-code"></i> 技术博客</div>
            <div class="profile-tag"><i class="fas fa-tools"></i> 网络工具集</div>
            <div class="profile-tag"><i class="fas fa-rocket"></i> 个人项目</div>
            <div class="profile-tag"><i class="fas fa-book"></i> 学习笔记</div>
          </div>
        </div>
      `;
      
      // 创建Hello World标题
      const helloWorld = document.createElement('div');
      helloWorld.className = 'home-header';
      helloWorld.innerHTML = '<h1>Hello World</h1>';
      
      // 插入到文章列表前
      postList.parentNode.insertBefore(profileCard, postList);
      postList.parentNode.insertBefore(helloWorld, postList);
    }
  }
}); 