/* eslint-disable indent */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const dngndFunc = {
  speed: 'normal',
  randomString(length = 20) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return '_' + result + btoa(new Date().getTime()).replace(/=/g, '');
  },
  string2clip(string, elem) {
    $(elem).attr('data-clipboard-text', string);
    const tempClass = this.randomString();
    elem.classList.add(tempClass);
    const clipboard = new ClipboardJS('.' + tempClass);
    clipboard.on('success', function(e) {
      dngndFunc.msgBox('Copied to clipboard');
    });
    setTimeout(() => elem.classList.remove(tempClass), 0);
  },
  msgBox(message = 'Thông báo!', duration = 1000) {
    // Type: https://getbootstrap.com/docs/4.0/components/alerts/

    // Tạo 1 id tạm thời cho container thông báo, mỗi 1 noti là 1 id riêng, tránh trùng lặp với noti trước nếu 2 cái overlap nhau
    const tempID = this.randomString();
    // Tạo container chứa dngndFunc.msgBox nếu chưa có
    if (!$('.alert-container')[0]) {
      $('body').append(`<div class="alert-container"><div class="inneralert-container"></div></div>`);
    }
    $('.inneralert-container').append( /* html */
      `<div class="alert standard-btn" id=${tempID} role=alert style=display:none>
        <div class=btn-inner>${message}</div>
      </div>`,
    );
    $('#' + tempID).slideDown(this.speed);
    setTimeout(() => {
      $(`#${tempID}`).slideUp(this.speed, () => $(`#${tempID}`).remove());
    }, duration);
  },
  toggleElem(elem) {
    // Source: https://stackoverflow.com/a/7435955
    const target = $(elem).attr('toggle-target');
    const status = elem.checked;
    // Fix slideToggle glitching
    if ($(target)[0].style.overflow !== 'hidden') $(target)[0].style.overflow = 'hidden';
    if ($(target).attr('prevDisplay') != 'block') {
      $(target)[0].style.display = 'block';
      $(target).attr('prevDisplay', 'block');
      $(target).hide();
    }
    if (status) {
      $(target).slideDown(this.speed);
    } else if (!status) {
      $(target).slideUp(this.speed);
    }
    if (!this.isFirefox() && this.isFromUserAction) this.saveCheckboxStateToLocalStorage(elem);
  },
  isFromUserAction: false,
  async dlGridView(data_file, element) {
    if (!element) return new Error('Invalid element');
    element.classList.add('direct-link-grid-view');
    data = await this.getYAML(data_file) || [];
    if (!data.length) return new Error('This', data, 'is invalid or empty');
    for (const elem of data) {
      const
        episode = elem.episode;
      const poster = elem.poster || '/img/blank.jpg';
      let posterWEBP = '';
      let summary = '';
      if (elem.webp) posterWEBP = /* html */ `<source srcset="${elem.webp}" type="image/webp">`;

      // Tên tập, nếu không có stt thì chỉ dùng tên tập
      let title = /* html */ `<div class="title">${elem.title}</div>`;
      if (episode) title = /* html */ `<div class="title">${episode}. ${elem.title}</div>`;

      // Gộp chung duration với filesize thành extraIn4
      let duration = elem.duration;
      let size = elem.size;
      let extraIn4 = '';

      if (!duration) duration = '';
      if (!size) size = '';
      if (duration && !size) extraIn4 = `<div>${duration}</div>`;
      if (size && !duration) extraIn4 = `<div>${size}</div>`;
      if (duration && size) extraIn4 = `<div>${duration}&nbsp;•&nbsp;${size}</div>`;

      if (elem.summary) summary = /* html */ `<div class="custom-hr"></div><p class="epSummary">${elem.summary}</p>`;

      $(element).append( /* html */ `
      <div class="an-episode">
        <div class="episode-image" onclick='dngndFunc.string2clip("${elem.url}",this)'>
          <picture>
            ${posterWEBP}
            <source srcset="${poster}" type="image/jpg">
            <img src="${poster}">
          </picture>
          <span><i class="fad fa-copy"></i></span>
        </div>
        ${title}
        ${extraIn4}
        ${summary}
      </div>
      `);
    };
  },
  async dlTableView(data_file, element, directOrNormal = 'normal') {
    if (!element) return new Error('Invalid element');
    const data = await this.getYAML(data_file) || [];
    if (!data.length) return new Error('Invalid', data);
    const output = [];
    let subtitles_header = '';

    for (const elem of data) {
      if (elem.subs) subtitles_header = `<th>Subtitle</th>`;
    }

    output.push( /* html */ `
      <div class=table>
        <table>
            <thead><tr>
                <th>Episode</th>
                <th>Title</th>
                <th>Server</th>
                ${subtitles_header}
            </tr></thead>
          <tbody>
    `);

    const createBtn = (type, display, display2, data) => {
      type = type.toLowerCase();
      const temp = [];
      if (type == 'direct') {
        temp.push( /* html */ `<span class="standard-btn interactable" onclick="dngndFunc.string2clip(\`${data}\`,this)">`);
        if (!display2) temp.push(`<span class="btn-inner">${display}</span>`);
        else if (display2) {
          temp.push( /* html */ `
            <div class="btn-inner-slide">${display}</div>
            <div class="btn-inner-alter">${display2}</div>
          `);
        }
        temp.push(`</span>`);
      } else if (type == 'normal') {
        if (!display2) {
          temp.push( /* html */ `
          <a href="${data}" target="_blank" rel="noopener noreferrer">
            <div class="standard-btn interactable">
              <div class="btn-inner">${display}</div>
            </div>
          </a>
        `);
        } else if (display2) {
          temp.push( /* html */ `
          <div class="standard-btn interactable">
            <a href="${data}" target="_blank" slide="1" rel="noreferrer noopener">
              <div class="btn-inner-slide">${display}</div>
              <div class="btn-inner-alter">${display2}</div>
            </a>
          </div>
      `);
        }
      }
      return temp.join('');
    };
    // const createSubBtn = (language, data) => {
    //   return `<span class='flag ${language.toLowerCase()}'></span>`;
    // };
    for (const episode of data) {
      output.push(`
        <tr>
          <th>${episode.episode}</th>
          <td>${episode.title}</td>
          <th>
      `);

      // iterate urls array from data
      for (const i of episode.urls) {
        e = i.split('__');
        if (e.length == 3) output.push(createBtn(e[0], e[1], false, e[2]));
        if (e.length == 4) output.push(createBtn(e[0], e[1], e[2], e[3]));
      };

      // iterate captions array from data
      if (episode.subs) {
        output.push(`</th><th>`);
        for (const i of episode.subs) {
          language = i.split('__');
          output.push( /* html */ `
            <a class="flag" href="${language[1]}" download="[${document.querySelector('title').innerHTML.replace(' – Delnegend', '')}] ${language[1].replace('/', '_')}">
              <img class="flag interactable" src="/flag/${language[0].toLowerCase()}.svg">
            </a>`);
        }
        output.push(`</th></tr>`);
      } else if (!episode.subs) {
        output.push(`</th></tr>`);
      }
    }

    // iterate subs array from data

    output.push(`</tbody></table></div>`);
    element.append(this.string2Node(output.join('').replace('/[\t\n\r\s]+/g', '')));
  },
  saveCheckboxStateToLocalStorage(checkboxElem) {
    // Lấy dữ liệu object từ localStorage
    const allData = JSON.parse(localStorage.getItem('checkbox_check') || '{}');
    // Key này là pathname của url, thay / thành _ để dùng làm key của object trên
    const key = window.location.pathname.replace(/\//g, '_');
    // Dữ liệu là array
    const data = allData[key] || [];
    const checkboxCSSPath = $(checkboxElem).fullSelector();
    // Loại bỏ elem rỗng
    this.removeElemFromArr(data, '');
    // Đẩy css path của checkbox vào
    if (checkboxElem.checked && !data.includes(checkboxCSSPath)) {
      data.push(checkboxCSSPath);
    } else if (!checkboxElem.checked && data.includes(checkboxCSSPath)) {
      this.removeElemFromArr(data, checkboxCSSPath);
    }
    // Đẩy lại lên object
    allData[key] = data;
    localStorage.setItem('checkbox_check', JSON.stringify(allData));
  },
  removeElemFromArr(array, elem) {
    const index = array.indexOf(elem);
    if (index > -1) array.splice(index, 1);
  },
  objLength(obj) {
    let count = 0;
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) count++;
    }
    return count;
  },
  isFirefox() {
    if (typeof InstallTrigger !== 'undefined') return true;
    else if (typeof InstallTrigger === 'undefined') return false;
  },
  string2Node(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },
  tweakTable(e) {
    e.setAttribute('tweaked', '');
    $(e.querySelector('table')).sticky({
      top: 'thead tr',
    });
    $(e).floatingScroll();
  },
  getYAML(url) {
    return new Promise((resolve) => {
      let request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) resolve(YAML.parse(this.responseText));
          else resolve(void 0);
        }
      };
      request.send();
      request = null;
    });
  },
};
$(document).ready(async () => {
  $('.table').each((i, e) => (!e.getAttribute('tweaked')) && dngndFunc.tweakTable(e));

  // #region Khởi tạo mấy cái khung download
  (() => {
    const
      a = 'dl-grid-view';
    const b = 'dl-table-view';
    const reTweakTable = (e) => (!e.querySelector('.table').getAttribute('tweaked')) && dngndFunc.tweakTable(e);
    if ($(a).length) $(a).each((i, e) => dngndFunc.dlGridView(e.getAttribute('data'), e));
    if ($(b).length) {
      $(b).each(async (index, elem) => {
        await dngndFunc.dlTableView(elem.getAttribute('data'), elem);
        reTweakTable(elem);
      });
    }
  })();
  // #endregion

  // #region Firefox Lưu lại state "check" của btn
  if (dngndFunc.isFirefox()) {
    $('.toggleElemBtn>input').each((i, e) => {
      const status = e.checked;
      if (status) {
        e.click();
        e.click();
      }
    });
  }
  // #endregion

  $('.menu .close-menu').on('click', () => {
    $('.menu').addClass('hidden');
  });
  $('.navbarContainer .open-menu').on('click', ()=>{
    $('.menu').removeClass('hidden');
  });
});
window.addEventListener('load', () => {
  if (!dngndFunc.isFirefox()) {
    const a = JSON.parse(localStorage.getItem('checkbox_check'));
    let data;
    if (a) {
      data = a[window.location.pathname.replace(/\//g, '_')] || [];
      if (data.length) data.forEach((e) => $(e).click());
    }
    dngndFunc.isFromUserAction = true;
  }
});

// #region WEBP Polyfill
(() => {
  const isSafari = /constructor/i.test(window.HTMLElement) || (function(p) {
    return p.toString() === '[object SafariRemoteNotification]';
  })(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification));

  if (!!document.documentMode || isSafari) {
    const webpMachine = new webpHero.WebpMachine();
    webpMachine.polyfillDocument();
  }
})();
// #endregion

// #region Get the DOM path of the clicked <a> | Source: https://stackoverflow.com/a/28150097
$.fn.fullSelector = function() {
  const path = this.parents().addBack();
  const quickCss = path.get().map((item) => {
    const self = $(item);
    const id = item.id ? '#' + item.id : '';
    const clss = item.classList.length ? item.classList.toString().split(' ').map((c) => '.' + c).join('') : '';
    const name = item.nodeName.toLowerCase();
    const index = self.siblings(name).length ? ':nth-child(' + (self.index() + 1) + ')' : '';
    if (name === 'html' || name === 'body') return name;
    return name + index + id + clss;
  }).join(' > ');
  return quickCss;
};
// #endregion
