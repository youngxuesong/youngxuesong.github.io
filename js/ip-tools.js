document.addEventListener('DOMContentLoaded', function() {
  const ipInput = document.getElementById('ipInput');
  const ipSearchBtn = document.getElementById('ipSearchBtn');
  const ipAddress = document.getElementById('ipAddress');
  const ipLocation = document.getElementById('ipLocation');
  const ipAsn = document.getElementById('ipAsn');
  const ipAsnOwner = document.getElementById('ipAsnOwner');
  const ipCompany = document.getElementById('ipCompany');
  const ipLongitude = document.getElementById('ipLongitude');
  const ipLatitude = document.getElementById('ipLatitude');
  const ipType = document.getElementById('ipType');
  const ipRisk = document.getElementById('ipRisk');
  const riskBarInner = document.getElementById('riskBarInner');
  const riskValue = document.getElementById('riskValue');
  const pingLink = document.getElementById('pingLink');
  const traceLink = document.getElementById('traceLink');

  // 获取当前用户IP
  fetchUserIP();
  
  // 绑定查询按钮点击事件
  ipSearchBtn.addEventListener('click', function() {
    let ip = ipInput.value.trim();
    if (ip) {
      searchIP(ip);
    } else {
      alert('请输入要查询的IP地址');
    }
  });
  
  // 绑定回车事件
  ipInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      ipSearchBtn.click();
    }
  });

  // 获取用户当前IP
  function fetchUserIP() {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        ipInput.value = data.ip;
        searchIP(data.ip);
      })
      .catch(error => {
        console.error('获取IP失败:', error);
      });
  }

  // 查询IP信息
  function searchIP(ip) {
    // 显示加载状态
    showLoading(true);
    
    // 使用ipinfo.io的API获取IP信息
    fetch(`https://ipinfo.io/${ip}/json`)
      .then(response => response.json())
      .then(data => {
        displayResult(ip, data);
      })
      .catch(error => {
        console.error('查询IP失败:', error);
        resetFields();
        alert('查询失败，请检查IP格式或稍后重试');
      })
      .finally(() => {
        showLoading(false);
      });
  }

  // 展示结果
  function displayResult(ip, data) {
    // 更新IP地址
    ipAddress.textContent = ip;
    
    // 更新IP位置信息
    if (data.country && data.region && data.city) {
      let countryFlag = '';
      if (data.country === 'CN') {
        countryFlag = '🇨🇳 ';
      } else if (data.country === 'HK') {
        countryFlag = '🇭🇰 ';
      } else if (data.country === 'US') {
        countryFlag = '🇺🇸 ';
      }
      
      ipLocation.textContent = `${countryFlag}${data.country} ${data.region} ${data.city}`;
    } else {
      ipLocation.textContent = '未知';
    }
    
    // 更新ASN信息
    if (data.org) {
      const asnMatch = data.org.match(/AS(\d+)/);
      if (asnMatch) {
        const asnNumber = asnMatch[1];
        ipAsn.innerHTML = `<a href="https://bgp.he.net/AS${asnNumber}" target="_blank">AS${asnNumber}</a>`;
      } else {
        ipAsn.textContent = '未知';
      }
    } else {
      ipAsn.textContent = '未知';
    }
    
    // 更新ASN所有者和企业信息
    if (data.org) {
      const orgName = data.org.replace(/^AS\d+\s/, '');
      ipAsnOwner.textContent = orgName;
      ipCompany.textContent = orgName;
    } else {
      ipAsnOwner.textContent = '未知';
      ipCompany.textContent = '未知';
    }
    
    // 更新经纬度信息
    if (data.loc) {
      const [lat, lon] = data.loc.split(',');
      ipLatitude.textContent = lat;
      ipLongitude.textContent = lon;
    } else {
      ipLatitude.textContent = '未知';
      ipLongitude.textContent = '未知';
    }
    
    // 判断IP类型
    determineIPType(ip, data);
    
    // 设置风险值（模拟）
    const risk = Math.floor(Math.random() * 100);
    setRiskValue(risk);
    
    // 设置ping和trace链接
    pingLink.href = `https://ping.pe/${ip}`;
    traceLink.href = `https://ping.pe/${ip}#traceroute`;
  }

  // 判断IP类型
  function determineIPType(ip, data) {
    // 这里简单判断，实际情况可能更复杂
    if (data.org && data.org.toLowerCase().includes('cloud')) {
      ipType.innerHTML = '<span class="ip-type-label idc">IDC机房IP</span>';
    } else if (data.org && (data.org.toLowerCase().includes('mobile') || data.org.toLowerCase().includes('carrier'))) {
      ipType.innerHTML = '<span class="ip-type-label mobile">移动网络IP</span>';
    } else {
      ipType.innerHTML = '<span class="ip-type-label normal">普通IP</span>';
    }
  }

  // 设置风险值
  function setRiskValue(value) {
    riskBarInner.style.width = `${value}%`;
    riskValue.textContent = `${value}% ${getRiskLevel(value)}`;
  }

  // 获取风险等级描述
  function getRiskLevel(value) {
    if (value < 20) {
      return '安全';
    } else if (value < 40) {
      return '低风险';
    } else if (value < 60) {
      return '中风险';
    } else if (value < 80) {
      return '高风险';
    } else {
      return '极高风险';
    }
  }

  // 重置字段
  function resetFields() {
    ipAddress.textContent = '-';
    ipLocation.textContent = '-';
    ipAsn.textContent = '-';
    ipAsnOwner.textContent = '-';
    ipCompany.textContent = '-';
    ipLongitude.textContent = '-';
    ipLatitude.textContent = '-';
    ipType.textContent = '-';
    riskBarInner.style.width = '0%';
    riskValue.textContent = '-';
  }

  // 显示加载状态
  function showLoading(isLoading) {
    if (isLoading) {
      ipSearchBtn.textContent = '查询中...';
      ipSearchBtn.disabled = true;
    } else {
      ipSearchBtn.textContent = '查询';
      ipSearchBtn.disabled = false;
    }
  }

  // 添加简单的懒加载支持
  const lazyImages = document.querySelectorAll('img.lazyload');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => observer.observe(img));
}); 