
function html2md(htmlData) {
    codeContent = new Array  // code标签数据
    preContent = new Array  // pre标签数据
    tableContent = new Array  // table标签数据
    olContent = new Array  // ol标签数据
    imgContent = new Array  // img标签数据
    aContent = new Array  // a标签数据
    let pureHtml = htmlData

    // 源代码
    // console.log("转换前的源码：" + pureHtml)

    // 函数：删去html标签
    function clearHtmlTag(sourceData = '') {
        return sourceData.replace(/\<[\s\S]*?\>/g, '')
    }

    // 复原ol标签
    function olRecover(olData = '') {
        let result = olData
        let num = olData.match(/\<li\>/ig).length
        for (let i = 1; i <= num; i++) {
            let line = '[~wrap]'
            if (i == 1) line = '[~wrap][~wrap]'
            result = result.replace(/\<li\>/i, line + i + '. ')
        }
        result = result.replace(/\<\/li\>/, '')
        return result
    }

    // 函数：复原img标签
    function imgRecover(imgHtml = '') {
        let imgSrc, imgTit, imgAlt, result
        imgSrc = imgHtml.match(/(?<=src=['"])[\s\S]*?(?=['"])/i)
        imgTit = imgHtml.match(/(?<=title=['"])[\s\S]*?(?=['"])/i)
        imgAlt = imgHtml.match(/(?<=alt=['"])[\s\S]*?(?=['"])/i)

        imgTit = (imgTit != null) ? ` "${imgTit}"` : ' '
        imgAlt = (imgAlt != 'null') ? imgAlt : " "
        result = `![${imgAlt}](${imgSrc}${imgTit})`
        return result
    }

    // 函数：复原a标签
    function aRecover(aData = '') {
        let aHref = '' + aData.match(/(?<=href=['"])[\s\S]*?(?=['"])/i)
        let aTit = '' + aData.match(/(?<=title=['"])[\s\S]*?(?=['"])/i)
        let aText = '' + aData.match(/(?<=\<a\s*[^\>]*?\>)[\s\S]*?(?=<\/a>)/i)

        let aImg = aData.match(/<img\s*[^\>]*?\>[^]*?(<\/img>)?/i)
        let aImgSrc, aImgTit, aImgAlt

        aTit = (aTit != 'null') ? ` "${aTit}"` : ' '
        aText = clearHtmlTag(aText)
        let result = `[${aText}](${aHref}${aTit})`

        if (aImg != null) {  // 函数：如果发现图片,则更换为图片显示模式
            aImgSrc = aImg[0].match(/(?<=src=['"])[\s\S]*?(?=['"])/i)
            aImgTit = aImg[0].match(/(?<=title=['"])[\s\S]*?(?=['"])/i)
            aImgAlt = aImg[0].match(/(?<=alt=['"])[\s\S]*?(?=['"])/i)

            aImgTit = (aImgTit != null) ? ` "${aImgTit}"` : ' '
            aImgAlt = (aImgAlt != 'null') ? aImgAlt : " "
            result = `[![${aImgAlt}](${aImgSrc}${aImgTit})](${aHref}${aTit})`
        }
        return result
    }

    // 函数：复原table标签
    function tableRecover(tableData = null) {
        if (tableData[0] == null) {  // 如果不存在 th 标签，则默认表格为一层
            let result = ''
            let colNum = tableData[1].length

            for (let i = 0; i < colNum; i++) {
                result += `|${clearHtmlTag(tableData[1][i])}`
            }
            result += `|[~wrap]`
            for (let j = 0; j < colNum; j++) {
                result += `| :------------: `
            }
            result += `|[~wrap]`
            return result
        }
        let colNum = tableData[0].length  // 如果存在 th 标签，则按 th 的格数来构建整个表格
        let result = ''

        for (let i = 0; i < colNum; i++) {
            result += `|${clearHtmlTag(tableData[0][i])}`
        }
        result += `|[~wrap]`
        for (let j = 0; j < colNum; j++) {
            result += `| :------------: `
        }
        result += `|[~wrap]`
        for (let k = 0; k < tableData[1].length;) {
            for (let z = 0; z < colNum; z++, k++) {
                result += `|${clearHtmlTag(tableData[1][k])}`
            }
            result += `|[~wrap]`
        }
        return result + `[~wrap]`
    }
    // 去掉样式和脚本极其内容
    pureHtml = pureHtml.replace(/<style\s*[^\>]*?\>[^]*?<\/style>/ig, '').replace(/<script\s*[^\>]*?\>[^]*?<\/script>/ig, '')

    // 储存pre的内容,并替换<pre>中的内容
    preContent = pureHtml.match(/<pre\s*[^\>]*?\>[^]*?<\/pre>/ig)
    pureHtml = pureHtml.replace(/(?<=\<pre\s*[^\>]*?\>)[\s\S]*?(?=<\/pre>)/ig, '`#preContent#`')

    // 储存code的内容,并替换<code>中的内容
    codeContent = pureHtml.match(/(?<=\<code\s*[^\>]*?\>)[\s\S]*?(?=<\/code>)/ig)
    pureHtml = pureHtml.replace(/(?<=\<code\s*[^\>]*?\>)[\s\S]*?(?=<\/code>)/ig, '`#codeContent#`')

    // 储存a的内容,并替换<a>中的内容
    aContent = pureHtml.match(/<a\s*[^\>]*?\>[^]*?<\/a>/ig)
    pureHtml = pureHtml.replace(/<a\s*[^\>]*?\>[^]*?<\/a>/ig, '`#aContent#`')

    // 储存img的内容,并替换<img>中的内容
    imgContent = pureHtml.match(/<img\s*[^\>]*?\>[^]*?(<\/img>)?/ig)
    pureHtml = pureHtml.replace(/<img\s*[^\>]*?\>[^]*?(<\/img>)?/ig, '`#imgContent#`')

    // 获取纯净（无属性）的 html
    pureHtml = pureHtml.replace(/(?<=\<[a-zA-Z0-9]*)\s.*?(?=\>)/g, '')

    // 标题：标获取<h1><h2>...数据,并替换
    pureHtml = pureHtml.replace(/<h1>/ig, '[~wrap]# ').replace(/<\/h1>/ig, '[~wrap][~wrap]')
        .replace(/<h2>/ig, '[~wrap]## ').replace(/<\/h2>/ig, '[~wrap][~wrap]')
        .replace(/<h3>/ig, '[~wrap]### ').replace(/<\/h3>/ig, '[~wrap][~wrap]')
        .replace(/<h4>/ig, '[~wrap]#### ').replace(/<\/h4>/ig, '[~wrap][~wrap]')
        .replace(/<h5>/ig, '[~wrap]##### ').replace(/<\/h5>/ig, '[~wrap][~wrap]')
        .replace(/<h6>/ig, '[~wrap]###### ').replace(/<\/h6>/ig, '[~wrap][~wrap]')

    // 段落：处理一些常用的结构标签
    pureHtml = pureHtml.replace(/(<br>)/ig, '[~wrap]').replace(/(<\/p>)|(<br\/>)|(<\/div>)/ig, '[~wrap][~wrap]')
        .replace(/(<meta>)|(<span>)|(<p>)|(<div>)/ig, '').replace(/<\/span>/ig, '')

    // 粗体：替换<b><strong>
    pureHtml = pureHtml.replace(/(<b>)|(<strong>)/ig, '**').replace(/(<\/b>)|(<\/strong>)/ig, '**')

    // 斜体：替换<i><em><abbr><dfn><cite><address>
    pureHtml = pureHtml.replace(/(<i>)|(<em>)|(<abbr>)|(<dfn>)|(<cite>)|(<address>)/ig, '*').replace(/(<\/i>)|(<\/em>)|(<\/abbr>)|(<\/dfn>)|(<\/cite>)|(<\/address>)/ig, '*')

    // 删除线：替换<del>
    pureHtml = pureHtml.replace(/\<del\>/ig, '~~').replace(/\<\/del\>/ig, '~~')

    // 引用：替换<blockquote>
    pureHtml = pureHtml.replace(/\<blockquote\>/ig, '[~wrap][~wrap]> ').replace(/\<\/blockquote\>/ig, '[~wrap][~wrap]')

    // 水平线：替换<hr>
    pureHtml = pureHtml.replace(/\<hr\>/ig, '[~wrap][~wrap]------[~wrap][~wrap]')

    // 表格 <table>,得到数据,删除标签，然后逐层分析储存,最终根据结果生成
    tableContent = pureHtml.match(/(?<=\<table\s*[^\>]*?\>)[\s\S]*?(?=<\/table>)/ig)
    pureHtml = pureHtml.replace(/<table\s*[^\>]*?\>[^]*?<\/table>/ig, '`#tableContent#`')
    if (tableContent !== null) {  // 分析储存
        tbodyContent = new Array
        for (let i = 0; i < tableContent.length; i++) {
            tbodyContent[i] = new Array  // tbodyContent[i]的第一个数据是thead数据,第二个是tbody的数据
            tbodyContent[i].push(tableContent[i].match(/(?<=\<th>)[\s\S]*?(?=<\/th?>)/ig))
            tbodyContent[i].push(tableContent[i].match(/(?<=\<td>)[\s\S]*?(?=<\/td?>)/ig))
        }
    }
    if (typeof tbodyContent !== "undefined") {  // 替换
        for (let i = 0; i < tbodyContent.length; i++) {
            let tableText = tableRecover(tbodyContent[i])
            pureHtml = pureHtml.replace(/\`\#tableContent\#\`/i, tableText)
        }
    }

    // 有序列表<ol>的<li>,储存ol的内容,并循环恢复ol中的内容
    olContent = pureHtml.match(/(?<=\<ol\s*[^\>]*?\>)[\s\S]*?(?=<\/ol>)/ig)
    pureHtml = pureHtml.replace(/(?<=\<ol\s*[^\>]*?\>)[\s\S]*?(?=<\/ol>)/ig, '`#olContent#`')
    if (olContent !== null) {
        for (let k = 0; k < olContent.length; k++) {
            let olText = olRecover(olContent[k])
            pureHtml = pureHtml.replace(/\`\#olContent\#\`/i, clearHtmlTag(olText))
        }
    }

    // 无序列表<ul>的<li>，以及<dd>,直接替换
    pureHtml = pureHtml.replace(/(<li>)|(<dd>)/ig, '[~wrap] - ').replace(/(<\/li>)|(<\/dd>)/ig, '[~wrap][~wrap]')

    // 处理完列表后，将 <lu>、<\lu>、<ol>、<\ol> 处理
    pureHtml = pureHtml.replace(/(<ul>)|(<ol>)/ig, '').replace(/(<\/ul>)|(<\/ol>)/ig, '[~wrap][~wrap]')

    // 先恢复 img ,再恢复 a
    if (imgContent !== null) {
        for (let i = 0; i < imgContent.length; i++) {
            let imgText = imgRecover(imgContent[i])
            pureHtml = pureHtml.replace(/\`\#imgContent\#\`/i, imgText)
        }
    }

    // 恢复 a
    if (aContent !== null) {
        for (let k = 0; k < aContent.length; k++) {
            let aText = aRecover(aContent[k])
            pureHtml = pureHtml.replace(/\`\#aContent\#\`/i, aText)
        }
    }

    // 换行处理，1.替换 [~wrap] 为 ‘\n’   2.首行换行删去。   3.将其他过长的换行删去。
    pureHtml = pureHtml.replace(/\[\~wrap\]/ig, '\n')
        .replace(/\n{3,}/g, '\n\n')

    // 代码 <code> ,根据上面的数组恢复code,然后将code替换
    if (codeContent !== null) {
        for (let i = 0; i < codeContent.length; i++) {
            pureHtml = pureHtml.replace(/\`\#codeContent\#\`/i, clearHtmlTag(codeContent[i]))
        }
    }
    pureHtml = pureHtml.replace(/\<code\>/ig, ' ` ').replace(/\<\/code\>/ig, ' ` ')

    // 代码 <pre> ,恢复pre,然后将pre替换
    if (preContent !== null) {
        for (let k = 0; k < preContent.length; k++) {
            let preLanguage = preContent[k].match(/(?<=language-).*?(?=[\s'"])/i)
            let preText = clearHtmlTag(preContent[k])
            preText = preText.replace(/^1\n2\n(\d+\n)*/, '')  // 去掉行数

            preLanguage = (preLanguage != null && preLanguage[0] != 'undefined') ? preLanguage[0] + '\n' : '\n'
            pureHtml = pureHtml.replace(/\`\#preContent\#\`/i, preLanguage + preText)
        }
    }
    pureHtml = pureHtml.replace(/\<pre\>/ig, '```').replace(/\<\/pre\>/ig, '\n```\n')

    // 删去其余的html标签，还原预文本代码中的 '<' 和 '>'
    pureHtml = clearHtmlTag(pureHtml)
    pureHtml = pureHtml.replace(/\&lt\;/ig, '<').replace(/\&gt\;/ig, '>')

    // 删去头部的空行
    pureHtml = pureHtml.replace(/^\n{1,}/i, '')

    return pureHtml
}

function cleanTitle(title) {
    let str = title;
    str = str.trim(); // 去除前后空格
    str = str.replace(/\n/g, ""); // 去除换行符
    return str;
}


async function verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
        options.mode = 'readwrite';
    }
    // Check if permission was already granted. If so, return true.
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }
    // Request permission. If the user grants permission, return true.
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }
    // The user didn't grant permission, so return false.
    return false;
}


async function saveToLocal(url, title, content) {
    const options = {
        suggestedName: title + '.md',
        types: [
            {
                description: 'Markdown',
                accept: {
                    'text/plain': ['.md'],
                },
            },
        ],
    };
    const handle = await window.showSaveFilePicker(options);

    if (!verifyPermission(handle, true)) {
        return
    }

    try {
        const writable = await handle.createWritable();
        await writable.write(content);
        // Close the file and write the contents to disk.
        await writable.close();
    } catch (error) {
        // TODO error.
        console.log(error)
        saveToLocal(url, title, content);

    }

}





chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request.action === "save") {
            window.scrollTo(0, document.body.scrollHeight);

            await new Promise(r => setTimeout(r, 2000));


            // FIXME 处理微信公众号文章
            let url = request.url
            let title = cleanTitle(document.title);
            let content = document.innerHTML;
            let markdownContent = "";


            if (url.startsWith("https://mp.weixin.qq.com/")) {
                title = cleanTitle(document.querySelector('.rich_media_title').textContent);
                content = document.querySelector('.rich_media_content').innerHTML;
                markdownContent = html2md(content);
            } else {
            }
            if (markdownContent != "") {
                console.log(url, title);
                sourceSection = `[原文链接](${url})`
                saveToLocal(url, title, '\n' + sourceSection + '\n\n' + markdownContent);
            } else {

            }
        }

    }
);


// 点击保存按钮的回调
function onSave() {
    const inputText = $("#input").val();
    if (!inputText) {
        alert("请先输入内容");
        return;
    }
    // 在content_scripts中只能使用部分API，所以将输入的内容交给background页面处理
    chrome.runtime.sendMessage(chrome.runtime.id, {
        todo: "saveLog",
        data: inputText,
    });
}

// 打开添加日志弹窗
function showAddLogModal(text) {
    // 获取外部完整的图片URL
    const image = chrome.runtime.getURL("images/icon.png");
    const mask =
        '<div id="mask" style="position: fixed;top: 0;bottom: 0;left: 0;right: 0;width: 100%;height: 100%;background-color: #333333;opacity: 0.8;z-index:9998" />';
    const addLogModal = `<div id="modal" style="position: fixed;top: 50%;left: 50%;width: 400px;height: 200px;margin-left: -200px;margin-top: -100px;background-color: #ffffff;border-radius: 8px;z-index: 9999;display: flex;flex-direction: column;align-items: center;padding: 20px"><img src="${image}" alt="" width="60" height="60" style="border-radius: 4px"><input id="input" placeholder="请输入" required value="${text}" style="width: 320px;height: 46px;margin-top: 20px;border: 1px solid #000;border-radius: 4px;padding: 0 6px"><button id="save" style="width: 320px;height: 34px;margin-top: 20px;cursor: pointer;">保存</button></div>`;
    $(mask).appendTo(document.body);
    $(addLogModal).appendTo(document.body);
    $("#mask").click(closeAddLogModal);
    $("#save").click(onSave);
}

// 关闭添加日志弹窗
function closeAddLogModal() {
    $("#modal").remove();
    $("#mask").remove();
}
