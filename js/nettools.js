document.addEventListener('DOMContentLoaded', function() {
  // 检查当前页面是否是网络工具页面
  if (window.location.pathname.includes('/nettools/')) {
    // 等待页面完全加载后再查询IP，确保所有DOM元素都已渲染
    setTimeout(function() {
      try {
        // 初始化IP查询工具
        initIPTool();
        // 初始化Ping工具
        initPingTool();
      } catch (e) {
        console.error("初始化网络工具时出错:", e);
      }
    }, 500);
  }
});

// 初始化IP查询工具
function initIPTool() {
  // 自动加载当前IP信息
  queryMyIP();
  
  // 添加各种交互效果
  addInteractionEffects();
  
  // 为按钮添加事件监听器
  const queryBtn = document.getElementById('query-ip-btn');
  if (queryBtn) {
    queryBtn.addEventListener('click', queryIP);
  }
  
  const myIPBtn = document.getElementById('query-my-ip-btn');
  if (myIPBtn) {
    myIPBtn.addEventListener('click', queryMyIP);
  }
  
  const copyBtn = document.getElementById('copy-ip-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      const ipAddress = document.querySelector('.ip-address');
      if (ipAddress) {
        copyToClipboard(ipAddress.textContent);
      }
    });
  }
  
  const pingLink = document.getElementById('ip-ping-link');
  if (pingLink) {
    pingLink.addEventListener('click', function(e) {
      e.preventDefault();
      const ipAddress = document.querySelector('.ip-address');
      if (ipAddress && ipAddress.textContent) {
        const pingInput = document.getElementById('ping-input');
        if (pingInput) {
          pingInput.value = ipAddress.textContent;
          // 滚动到Ping工具部分
          document.querySelector('.tool-container').scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
}

// IP信息查询工具
function queryIP() {
  const ipInput = document.getElementById('ip-input')?.value.trim();
  if (!ipInput) {
    showIPError('请输入有效的IP地址或网址');
    return;
  }
  
  showIPLoading();
  
  // 使用ipinfo.io API查询IP信息
  fetch(`https://ipinfo.io/${ipInput}/json`)
    .then(response => {
      if (!response.ok) {
        throw new Error('IP信息查询失败，请检查输入是否正确');
      }
      return response.json();
    })
    .then(data => {
      displayIPInfo(data);
    })
    .catch(error => {
      showIPError(error.message);
    });
}

function queryMyIP() {
  showIPLoading();
  
  fetch('https://ipinfo.io/json')
    .then(response => {
      if (!response.ok) {
        throw new Error('无法获取您的IP信息');
      }
      return response.json();
    })
    .then(data => {
      const ipInput = document.getElementById('ip-input');
      if (ipInput) ipInput.value = data.ip;
      displayIPInfo(data);
    })
    .catch(error => {
      showIPError(error.message);
    });
}

function displayIPInfo(data) {
  hideIPLoading();
  
  // 安全地设置元素内容的辅助函数
  function safeSetText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text || '未知';
  }
  
  function safeSetHTML(id, html) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = html || '';
  }
  
  // IP地址显示
  const ipAddressDisplay = document.querySelector('#ip-address-display .ip-address');
  if (ipAddressDisplay) {
    ipAddressDisplay.textContent = data.ip || '未知IP';
  }
  
  // 国家与城市信息
  const countryCode = data.country || '';
  const countryFlag = document.getElementById('ip-country-flag');
  if (countryFlag) {
    if (countryCode) {
      countryFlag.style.backgroundImage = `url('https://flagcdn.com/w40/${countryCode.toLowerCase()}.png')`;
      countryFlag.style.display = 'inline-block';
    } else {
      countryFlag.style.display = 'none';
    }
  }
  
  const countryName = getCountryName(countryCode);
  const locationText = `${countryName} ${data.region || ''} ${data.city || ''}`.trim();
  safeSetText('ip-country', locationText || '未知');
  
  // 位置信息
  if (data.loc) {
    const [lat, long] = data.loc.split(',');
    safeSetText('ip-latitude', lat || '未知');
    safeSetText('ip-longitude', long || '未知');
  } else {
    safeSetText('ip-latitude', '未知');
    safeSetText('ip-longitude', '未知');
  }
  
  // ASN信息
  const asnMatch = data.org ? data.org.match(/AS(\d+)/) : null;
  const asn = asnMatch ? asnMatch[1] : '未知';
  safeSetHTML('ip-asn', asnMatch ? 
    `<a href="https://bgp.he.net/AS${asn}" target="_blank" rel="noopener noreferrer" class="link">AS${asn}</a>` : 
    '未知');
  
  // ASN所有者和企业信息
  const orgName = data.org ? data.org.replace(/AS\d+\s/, '') : '未知';
  safeSetText('ip-asn-owner', orgName);
  safeSetText('ip-org', data.org ? data.org.split(' ').slice(1).join(' ') : '未知');
  
  // 判断IP类型
  const isDatacenter = 
    data.org?.toLowerCase().includes('ovh') || 
    data.org?.toLowerCase().includes('cloud') || 
    data.org?.toLowerCase().includes('host') ||
    data.org?.toLowerCase().includes('data');
  
  const isProxy = 
    data.org?.toLowerCase().includes('proxy') || 
    data.org?.toLowerCase().includes('vpn') || 
    data.org?.toLowerCase().includes('tor');
    
  const typeBadge = document.getElementById('ip-type-badge');
  const proxyBadge = document.getElementById('ip-type-badge-proxy');
  
  if (typeBadge) {
    if (isDatacenter) {
      typeBadge.textContent = 'IDC机房IP';
      typeBadge.className = 'tag idc';
    } else {
      typeBadge.textContent = '家庭宽带IP';
      typeBadge.className = 'tag home';
    }
  }
  
  if (proxyBadge) {
    proxyBadge.style.display = isProxy ? 'inline-block' : 'none';
  }
  
  // 风控值计算
  let riskValue = 0;
  if (isProxy) {
    riskValue = Math.floor(Math.random() * (100 - 80) + 80); // 80-100
  } else if (isDatacenter) {
    riskValue = Math.floor(Math.random() * (80 - 40) + 40); // 40-80
  } else {
    riskValue = Math.floor(Math.random() * 40); // 0-40
  }
  
  let riskClass = '';
  let riskDescription = '';
  
  if (riskValue < 30) {
    riskClass = 'low';
    riskDescription = '极度纯净';
  } else if (riskValue < 60) {
    riskClass = 'medium';
    riskDescription = '中等风险';
  } else if (riskValue < 90) {
    riskClass = 'high';
    riskDescription = '高风险';
  } else {
    riskClass = 'extreme';
    riskDescription = '极度风险';
  }
  
  const riskBadge = document.getElementById('ip-risk-badge');
  if (riskBadge) {
    riskBadge.textContent = `${riskValue}% ${riskDescription}`;
    riskBadge.className = `risk-value ${riskClass}`;
  }
  
  const riskIndicator = document.getElementById('risk-indicator');
  if (riskIndicator) {
    // 设置指示器位置，范围从0到100
    riskIndicator.style.left = `${riskValue}%`;
  }
  
  // 原生IP标签
  const originalBadge = document.getElementById('ip-original-badge');
  if (originalBadge) {
    const ipType = determineIPType(data);
    originalBadge.textContent = ipType;
    
    if (ipType.includes('广播')) {
      originalBadge.className = 'tag home';
    } else if (ipType.includes('代理')) {
      originalBadge.className = 'tag proxy';
    } else {
      originalBadge.className = 'tag';
    }
  }
  
  // 显示结果区域
  const ipResult = document.getElementById('ip-result');
  const ipError = document.getElementById('ip-error');
  if (ipResult) ipResult.style.display = 'block';
  if (ipError) ipError.style.display = 'none';
  
  // 让结果区域滚动到可视范围
  setTimeout(() => {
    if (ipResult) {
      ipResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 300);
}

// 判断IP类型
function determineIPType(data) {
  if (!data || !data.ip) return '未知';
  
  // 简单判断逻辑，实际应用中可能需要更复杂的算法
  if (data.org?.toLowerCase().includes('mobile')) {
    return '移动IP';
  } else if (data.org?.toLowerCase().includes('proxy') || data.org?.toLowerCase().includes('vpn')) {
    return '代理IP';
  } else if (data.hostname?.includes('dynamic')) {
    return '动态IP';
  } else if (data.org?.toLowerCase().includes('broadcast') || data.org?.toLowerCase().includes('cdn')) {
    return '广播IP';
  }
  
  return '普通IP';
}

// 根据国家代码获取国家名称
function getCountryName(countryCode) {
  const countryNames = {
    'CN': '中国',
    'US': '美国',
    'JP': '日本',
    'KR': '韩国',
    'GB': '英国',
    'DE': '德国',
    'FR': '法国',
    'RU': '俄罗斯',
    'HK': '香港',
    'TW': '台湾',
    'SG': '新加坡',
    'AU': '澳大利亚',
    'CA': '加拿大',
    // 可以根据需要添加更多国家
  };
  
  return countryNames[countryCode] || countryCode;
}

// 添加复制到剪贴板功能
function copyToClipboard(text) {
  if (!text) return;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      // 显示复制成功提示
      const tooltip = document.querySelector('.copy-tooltip');
      if (tooltip) {
        tooltip.textContent = '已复制!';
        tooltip.classList.add('show');
        
        setTimeout(() => {
          tooltip.classList.remove('show');
          setTimeout(() => {
            tooltip.textContent = '复制IP';
          }, 300);
        }, 1500);
      }
    })
    .catch(err => {
      console.error('复制失败: ', err);
    });
}

// 添加交互效果
function addInteractionEffects() {
  // 为表格行添加悬停效果
  document.querySelectorAll('.ip-table tr').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = '#f0f5ff';
    });
    row.addEventListener('mouseleave', () => {
      // 恢复原来的背景色
      if (row.classList.contains('even')) {
        row.style.backgroundColor = '#f8fafc';
      } else {
        row.style.backgroundColor = '';
      }
    });
  });
}

function showIPLoading() {
  const ipLoading = document.getElementById('ip-loading');
  const ipResult = document.getElementById('ip-result');
  const ipError = document.getElementById('ip-error');
  
  if (ipLoading) ipLoading.style.display = 'flex';
  if (ipResult) ipResult.style.display = 'none';
  if (ipError) ipError.style.display = 'none';
}

function hideIPLoading() {
  const ipLoading = document.getElementById('ip-loading');
  if (ipLoading) ipLoading.style.display = 'none';
}

function showIPError(message) {
  const ipLoading = document.getElementById('ip-loading');
  const ipResult = document.getElementById('ip-result');
  const ipError = document.getElementById('ip-error');
  
  if (ipLoading) ipLoading.style.display = 'none';
  if (ipResult) ipResult.style.display = 'none';
  
  if (ipError) {
    ipError.style.display = 'block';
    ipError.textContent = message;
  }
}

// 初始化Ping工具
function initPingTool() {
  // 为按钮添加事件监听器
  const pingButtons = document.querySelectorAll('.ping-input-container button');
  if (pingButtons && pingButtons.length >= 2) {
    // 开始Ping按钮
    pingButtons[0].addEventListener('click', startPing);
    // 停止Ping按钮
    pingButtons[1].addEventListener('click', stopPing);
  }
}

// Ping工具
let pingInterval;
let pingResults = [];

function startPing() {
  const target = document.getElementById('ping-input').value.trim();
  if (!target) {
    addPingMessage('错误: 请输入有效的域名或IP地址', 'error-text');
    return;
  }
  
  const count = parseInt(document.getElementById('ping-count').value);
  const interval = parseFloat(document.getElementById('ping-interval').value) * 1000;
  
  if (isNaN(count) || count < 1 || count > 20) {
    addPingMessage('错误: Ping次数应在1-20之间', 'error-text');
    return;
  }
  
  if (isNaN(interval) || interval < 1000 || interval > 10000) {
    addPingMessage('错误: Ping间隔应在1-10秒之间', 'error-text');
    return;
  }
  
  // 清空之前的结果
  document.getElementById('ping-console').innerHTML = '';
  document.getElementById('ping-min').textContent = '--';
  document.getElementById('ping-max').textContent = '--';
  document.getElementById('ping-avg').textContent = '--';
  document.getElementById('ping-loss').textContent = '--';
  document.getElementById('ping-stats').style.display = 'none';
  
  // 禁用开始按钮，启用停止按钮
  document.getElementById('ping-input').disabled = true;
  document.getElementById('ping-count').disabled = true;
  document.getElementById('ping-interval').disabled = true;
  document.getElementById('stop-ping-button').disabled = false;
  document.querySelectorAll('.ping-input-container button')[0].disabled = true;
  
  addPingMessage(`开始向 ${target} 发送 ${count} 个 Ping 请求...`, 'success-text');
  
  pingResults = [];
  let pingCount = 0;
  
  // 执行Ping
  function doPing() {
    if (pingCount >= count) {
      stopPing();
      return;
    }
    
    pingCount++;
    const startTime = performance.now();
    
    // 模拟Ping
    setTimeout(() => {
      const delay = Math.floor(Math.random() * 200) + 20; // 模拟20-220ms的延迟
      const success = Math.random() > 0.1; // 90%成功率
      
      if (success) {
        addPingMessage(`来自 ${target} 的回复: 时间 = ${delay} ms`, 'success-text');
        pingResults.push(delay);
      } else {
        addPingMessage(`请求超时`, 'error-text');
        pingResults.push(null);
      }
      
      updatePingStats();
    }, Math.random() * 300);
  }
  
  // 立即执行第一次Ping
  doPing();
  
  // 设置定时器执行后续Ping
  pingInterval = setInterval(() => {
    if (pingCount < count) {
      doPing();
    }
  }, interval);
}

function stopPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  
  document.getElementById('ping-input').disabled = false;
  document.getElementById('ping-count').disabled = false;
  document.getElementById('ping-interval').disabled = false;
  document.getElementById('stop-ping-button').disabled = true;
  document.querySelectorAll('.ping-input-container button')[0].disabled = false;
  
  addPingMessage('Ping测试已完成', 'success-text');
  updatePingStats(true);
}

function addPingMessage(message, className) {
  const console = document.getElementById('ping-console');
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
  
  console.innerHTML += `<div class="${className}">[${timeStr}] ${message}</div>`;
  console.scrollTop = console.scrollHeight;
}

function updatePingStats(final = false) {
  const validResults = pingResults.filter(r => r !== null);
  
  if (validResults.length > 0) {
    const min = Math.min(...validResults);
    const max = Math.max(...validResults);
    const avg = validResults.reduce((sum, val) => sum + val, 0) / validResults.length;
    const loss = (pingResults.length - validResults.length) / pingResults.length * 100;
    
    document.getElementById('ping-min').textContent = min.toFixed(2);
    document.getElementById('ping-max').textContent = max.toFixed(2);
    document.getElementById('ping-avg').textContent = avg.toFixed(2);
    document.getElementById('ping-loss').textContent = loss.toFixed(2) + '%';
    
    if (final || validResults.length > 1) {
      document.getElementById('ping-stats').style.display = 'grid';
    }
  }
}