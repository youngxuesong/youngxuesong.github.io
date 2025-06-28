// JSON工具功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const jsonInput1 = document.getElementById('json-input-1');
    const jsonInput2 = document.getElementById('json-input-2');
    const jsonMergeBtn = document.getElementById('json-merge-btn');
    const jsonOptionsBtn = document.getElementById('json-options-btn');
    const jsonResultArea = document.getElementById('json-result-area');
    const jsonResult = document.querySelector('.json-result');
    const jsonCopyBtn = document.getElementById('json-copy-btn');
    const jsonDownloadBtn = document.getElementById('json-download-btn');
    const jsonUpload1 = document.getElementById('json-upload-1');
    const jsonUpload2 = document.getElementById('json-upload-2');
    
    // 获取新增UI元素
    const jsonTabBtns = document.querySelectorAll('.json-tab-btn');
    const jsonViewToggle = document.getElementById('json-view-toggle');
    const jsonMergeStrategy = document.getElementById('json-merge-strategy');
    const jsonOptionsPanel = document.getElementById('json-options-panel');
    const closeOptionsBtn = document.getElementById('close-options');
    const jsonPrettifyBtn = document.getElementById('json-prettify-btn');
    const jsonMinifyBtn = document.getElementById('json-minify-btn');
    const jsonIndent = document.getElementById('json-indent');
    const jsonSortKeys = document.getElementById('json-sort-keys');
    const jsonEscapeUnicode = document.getElementById('json-escape-unicode');
    const clearJson1 = document.getElementById('clear-json-1');
    const clearJson2 = document.getElementById('clear-json-2');
    const formatJson1 = document.getElementById('format-json-1');
    const formatJson2 = document.getElementById('format-json-2');
    const expandResult = document.getElementById('expand-result');
    const sampleBtns = document.querySelectorAll('.json-sample-btn');

    // 设置默认示例JSON
    jsonInput1.value = '{\n  "example": "value",\n  "nested": {\n    "key": "originalValue"\n  }\n}';
    jsonInput2.value = '{\n  "additional": "data",\n  "nested": {\n    "key": "newValue",\n    "extra": true\n  }\n}';

    // 处理标签切换
    if (jsonTabBtns.length > 0) {
        jsonTabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                jsonTabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 根据选择的标签切换功能
                const tab = this.dataset.tab;
                updateUiForTab(tab);
            });
        });
    }
    
    // 根据标签更新UI
    function updateUiForTab(tab) {
        // 重置结果区域
        jsonResult.style.display = 'none';
        
        // 更新第二个输入面板的可见性
        const secondPanel = document.querySelectorAll('.json-panel')[1];
        if (!secondPanel) return;
        
        switch(tab) {
            case 'merge':
                secondPanel.style.display = 'block';
                if (jsonMergeBtn.querySelector('i')) {
                    jsonMergeBtn.innerHTML = '<i class="fas fa-object-group"></i> 合并';
                } else {
                    jsonMergeBtn.textContent = '合并';
                }
                break;
                
            case 'format':
                secondPanel.style.display = 'none';
                if (jsonMergeBtn.querySelector('i')) {
                    jsonMergeBtn.innerHTML = '<i class="fas fa-indent"></i> 格式化';
                } else {
                    jsonMergeBtn.textContent = '格式化';
                }
                break;
                
            case 'validate':
                secondPanel.style.display = 'none';
                if (jsonMergeBtn.querySelector('i')) {
                    jsonMergeBtn.innerHTML = '<i class="fas fa-check-circle"></i> 验证';
                } else {
                    jsonMergeBtn.textContent = '验证';
                }
                break;
                
            case 'compare':
                secondPanel.style.display = 'block';
                if (jsonMergeBtn.querySelector('i')) {
                    jsonMergeBtn.innerHTML = '<i class="fas fa-not-equal"></i> 比较';
                } else {
                    jsonMergeBtn.textContent = '比较';
                }
                break;
        }
        
        // 更新合并策略下拉菜单可见性
        if (jsonMergeStrategy) {
            if (tab === 'merge') {
                jsonMergeStrategy.style.display = 'inline-block';
            } else {
                jsonMergeStrategy.style.display = 'none';
            }
        }
    }

    // 视图切换功能
    if (jsonViewToggle) {
        jsonViewToggle.addEventListener('click', function() {
            const panels = document.querySelector('.json-panels');
            if (panels) {
                panels.classList.toggle('vertical-layout');
                
                // 更新按钮图标
                const icon = this.querySelector('i');
                if (icon) {
                    if (panels.classList.contains('vertical-layout')) {
                        icon.className = 'fas fa-grip-horizontal';
                    } else {
                        icon.className = 'fas fa-columns';
                    }
                }
            }
        });
    }

    // 处理文件上传
    jsonUpload1.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            readFile(file, jsonInput1);
        }
    });

    jsonUpload2.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            readFile(file, jsonInput2);
        }
    });

    // 文件读取函数
    function readFile(file, targetInput) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // 尝试解析JSON并格式化
                const json = JSON.parse(e.target.result);
                targetInput.value = JSON.stringify(json, null, 2);
            } catch (error) {
                // 如果解析失败，直接显示文本内容
                targetInput.value = e.target.result;
                showNotification('文件格式不是有效的JSON', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 合并JSON按钮点击事件
    jsonMergeBtn.addEventListener('click', function() {
        try {
            // 获取当前活动的标签
            const activeTab = document.querySelector('.json-tab-btn.active');
            const tabType = activeTab ? activeTab.dataset.tab : 'merge';
            
            switch(tabType) {
                case 'merge':
                    processMerge();
                    break;
                    
                case 'format':
                    processFormat();
                    break;
                    
                case 'validate':
                    processValidate();
                    break;
                    
                case 'compare':
                    processCompare();
                    break;
                    
                default:
                    processMerge(); // 默认执行合并操作
            }
        } catch (error) {
            showNotification('操作失败: ' + error.message, 'error');
        }
    });
    
    // 处理合并功能
    function processMerge() {
        try {
            const json1 = JSON.parse(jsonInput1.value.trim() || '{}');
            const json2 = JSON.parse(jsonInput2.value.trim() || '{}');
            
            let merged;
            
            // 根据选择的合并策略进行合并
            const strategy = jsonMergeStrategy ? jsonMergeStrategy.value : 'deep';
            
            switch(strategy) {
                case 'deep':
                    merged = deepMerge(json1, json2);
                    break;
                    
                case 'shallow':
                    merged = Object.assign({}, json1, json2);
                    break;
                    
                case 'array':
                    if (Array.isArray(json1) && Array.isArray(json2)) {
                        merged = [...json1, ...json2];
                    } else {
                        throw new Error('两个输入都必须是数组才能使用数组合并策略');
                    }
                    break;
                    
                default:
                    merged = deepMerge(json1, json2); // 默认使用深度合并
            }
            
            // 获取格式化选项
            const indentSpaces = jsonIndent && !isNaN(parseInt(jsonIndent.value)) ? 
                parseInt(jsonIndent.value) : 2;
            const sortKeys = jsonSortKeys ? jsonSortKeys.checked : false;
            const escapeUnicode = jsonEscapeUnicode ? jsonEscapeUnicode.checked : false;
            
            let resultText;
            
            if (sortKeys) {
                resultText = JSON.stringify(merged, (key, value) => {
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        return Object.keys(value).sort().reduce((result, key) => {
                            result[key] = value[key];
                            return result;
                        }, {});
                    }
                    return value;
                }, indentSpaces);
            } else {
                resultText = JSON.stringify(merged, null, indentSpaces);
            }
            
            if (escapeUnicode) {
                resultText = resultText.replace(/[\u007F-\uFFFF]/g, (chr) => {
                    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4);
                });
            }
            
            jsonResultArea.value = resultText;
            jsonResult.style.display = 'block';
            
            showNotification('JSON合并成功!', 'success');
        } catch (error) {
            showNotification('JSON格式错误: ' + error.message, 'error');
        }
    }
    
    // 处理格式化功能
    function processFormat() {
        try {
            const json = JSON.parse(jsonInput1.value.trim() || '{}');
            
            // 获取格式化选项
            const indentSpaces = jsonIndent && !isNaN(parseInt(jsonIndent.value)) ? 
                parseInt(jsonIndent.value) : 2;
            const sortKeys = jsonSortKeys ? jsonSortKeys.checked : false;
            const escapeUnicode = jsonEscapeUnicode ? jsonEscapeUnicode.checked : false;
            
            let resultText;
            
            if (sortKeys) {
                resultText = JSON.stringify(json, (key, value) => {
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        return Object.keys(value).sort().reduce((result, key) => {
                            result[key] = value[key];
                            return result;
                        }, {});
                    }
                    return value;
                }, indentSpaces);
            } else {
                resultText = JSON.stringify(json, null, indentSpaces);
            }
            
            if (escapeUnicode) {
                resultText = resultText.replace(/[\u007F-\uFFFF]/g, (chr) => {
                    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4);
                });
            }
            
            jsonResultArea.value = resultText;
            jsonResult.style.display = 'block';
            
            showNotification('JSON格式化成功!', 'success');
        } catch (error) {
            showNotification('JSON格式错误: ' + error.message, 'error');
        }
    }
    
    // 处理验证功能
    function processValidate() {
        try {
            JSON.parse(jsonInput1.value);
            jsonResultArea.value = "✅ JSON格式有效!\n\n这是一个有效的JSON数据。";
            jsonResult.style.display = 'block';
            showNotification('JSON验证成功!', 'success');
        } catch (error) {
            jsonResultArea.value = `❌ JSON格式无效!\n\n错误信息: ${error.message}`;
            jsonResult.style.display = 'block';
            showNotification('JSON格式无效!', 'error');
        }
    }
    
    // 处理比较功能
    function processCompare() {
        try {
            const json1 = JSON.parse(jsonInput1.value.trim() || '{}');
            const json2 = JSON.parse(jsonInput2.value.trim() || '{}');
            
            const differences = compareObjects(json1, json2);
            
            if (Object.keys(differences).length === 0) {
                jsonResultArea.value = "✅ 两个JSON完全相同!";
            } else {
                jsonResultArea.value = `发现 ${Object.keys(differences).length} 处差异:\n\n` + 
                    JSON.stringify(differences, null, 2);
            }
            
            jsonResult.style.display = 'block';
            showNotification('JSON比较完成!', 'success');
        } catch (error) {
            showNotification('比较失败: ' + error.message, 'error');
        }
    }
    
    // 比较两个对象并返回差异
    function compareObjects(obj1, obj2, path = '') {
        let differences = {};
        
        // 检查obj1中的键
        for (const key in obj1) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (!(key in obj2)) {
                differences[currentPath] = {
                    type: '仅在第一个对象中存在',
                    value: obj1[key]
                };
                continue;
            }
            
            if (typeof obj1[key] !== typeof obj2[key]) {
                differences[currentPath] = {
                    type: '类型不同',
                    value1: obj1[key],
                    value2: obj2[key]
                };
                continue;
            }
            
            if (typeof obj1[key] === 'object' && obj1[key] !== null) {
                if (Array.isArray(obj1[key]) !== Array.isArray(obj2[key])) {
                    differences[currentPath] = {
                        type: '一个是数组，一个是对象',
                        value1: obj1[key],
                        value2: obj2[key]
                    };
                } else {
                    const nestedDiff = compareObjects(obj1[key], obj2[key], currentPath);
                    differences = { ...differences, ...nestedDiff };
                }
                continue;
            }
            
            if (obj1[key] !== obj2[key]) {
                differences[currentPath] = {
                    type: '值不同',
                    value1: obj1[key],
                    value2: obj2[key]
                };
            }
        }
        
        // 检查obj2中仅有的键
        for (const key in obj2) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (!(key in obj1)) {
                differences[currentPath] = {
                    type: '仅在第二个对象中存在',
                    value: obj2[key]
                };
            }
        }
        
        return differences;
    }

    // 复制结果按钮
    jsonCopyBtn.addEventListener('click', function() {
        if (jsonResultArea.value) {
            navigator.clipboard.writeText(jsonResultArea.value)
                .then(() => showNotification('已复制到剪贴板!', 'success'))
                .catch(() => showNotification('复制失败，请手动复制', 'error'));
        }
    });

    // 下载结果按钮
    jsonDownloadBtn.addEventListener('click', function() {
        if (jsonResultArea.value) {
            const blob = new Blob([jsonResultArea.value], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'json_result_' + new Date().getTime() + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // 设置选项按钮
    jsonOptionsBtn.addEventListener('click', function() {
        if (jsonOptionsPanel) {
            jsonOptionsPanel.style.display = 'block';
        } else {
            showNotification('更多选项功能将在后续版本开放', 'info');
        }
    });
    
    // 关闭选项面板
    if (closeOptionsBtn) {
        closeOptionsBtn.addEventListener('click', function() {
            jsonOptionsPanel.style.display = 'none';
        });
    }
    
    // 美化JSON结果
    if (jsonPrettifyBtn) {
        jsonPrettifyBtn.addEventListener('click', function() {
            try {
                const json = JSON.parse(jsonResultArea.value);
                const indentSpaces = jsonIndent && !isNaN(parseInt(jsonIndent.value)) ? 
                    parseInt(jsonIndent.value) : 2;
                jsonResultArea.value = JSON.stringify(json, null, indentSpaces);
                showNotification('JSON美化成功!', 'success');
            } catch (error) {
                showNotification('无法美化：不是有效的JSON', 'error');
            }
        });
    }
    
    // 压缩JSON结果
    if (jsonMinifyBtn) {
        jsonMinifyBtn.addEventListener('click', function() {
            try {
                const json = JSON.parse(jsonResultArea.value);
                jsonResultArea.value = JSON.stringify(json);
                showNotification('JSON压缩成功!', 'success');
            } catch (error) {
                showNotification('无法压缩：不是有效的JSON', 'error');
            }
        });
    }
    
    // 清空输入框
    if (clearJson1) {
        clearJson1.addEventListener('click', function() {
            jsonInput1.value = '';
        });
    }
    
    if (clearJson2) {
        clearJson2.addEventListener('click', function() {
            jsonInput2.value = '';
        });
    }
    
    // 格式化输入框
    if (formatJson1) {
        formatJson1.addEventListener('click', function() {
            formatJsonInput(jsonInput1);
        });
    }
    
    if (formatJson2) {
        formatJson2.addEventListener('click', function() {
            formatJsonInput(jsonInput2);
        });
    }
    
    // 格式化JSON输入
    function formatJsonInput(input) {
        try {
            const json = JSON.parse(input.value.trim() || '{}');
            input.value = JSON.stringify(json, null, 2);
            showNotification('JSON格式化成功!', 'success');
        } catch (error) {
            showNotification('JSON格式错误: ' + error.message, 'error');
        }
    }
    
    // 结果区域展开/收起
    if (expandResult) {
        expandResult.addEventListener('click', function() {
            const resultPanel = document.querySelector('.json-result .json-panel');
            if (resultPanel) {
                resultPanel.classList.toggle('expanded');
                
                const icon = this.querySelector('i');
                if (icon) {
                    if (resultPanel.classList.contains('expanded')) {
                        icon.className = 'fas fa-compress';
                    } else {
                        icon.className = 'fas fa-expand';
                    }
                }
            }
        });
    }
    
    // 示例数据按钮
    if (sampleBtns && sampleBtns.length > 0) {
        sampleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const targetInput = document.getElementById(targetId);
                if (!targetInput) return;
                
                const samples = [
                    // 简单对象
                    '{\n  "name": "张三",\n  "age": 30,\n  "isActive": true,\n  "hobbies": ["读书", "旅行", "编程"]\n}',
                    
                    // 配置示例
                    '{\n  "server": {\n    "host": "localhost",\n    "port": 8080\n  },\n  "database": {\n    "user": "admin",\n    "password": "secret",\n    "name": "mydb"\n  },\n  "settings": {\n    "theme": "dark",\n    "notifications": true\n  }\n}',
                    
                    // 数据结构示例
                    '[\n  {\n    "id": 1,\n    "title": "任务1",\n    "completed": false\n  },\n  {\n    "id": 2,\n    "title": "任务2",\n    "completed": true\n  },\n  {\n    "id": 3,\n    "title": "任务3",\n    "completed": false\n  }\n]'
                ];
                
                // 随机选择一个示例
                const randomSample = samples[Math.floor(Math.random() * samples.length)];
                targetInput.value = randomSample;
            });
        });
    }

    // 深度合并两个对象的函数
    function deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }

    // 判断是否为对象
    function isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    // 显示通知提示
    function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `json-notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .json-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .json-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .json-notification.success {
            background-color: #10b981;
        }
        
        .json-notification.error {
            background-color: #ef4444;
        }
        
        .json-notification.info {
            background-color: #6366f1;
        }
    `;
    document.head.appendChild(style);
}); 