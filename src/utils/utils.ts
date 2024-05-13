export function getRandomColor() {
  const colorList = ['#67cc86', '#e15b64', '#abbd81', '#f26d6d', '#fb9b5f', '#3498db'];
  const randomIndex = Math.floor(Math.random() * colorList.length);
  return colorList[randomIndex];
}

export function delay(ms = 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

export function throttle(fn: Function) {
  let lock = false;
  return function (this: any, ...args: any[]) {
    if (lock) return;
    lock = true;
    window.requestAnimationFrame(() => {
      fn.apply(this, args);
      lock = false;
    });
  };
}

export function debounce(fn: Function, delay: number = 300) {
  let timer: number | null = null;
  return function (this: any, ...args: any[]) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function ajax(url: string) {
  return new Promise(resolve => {
    let xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
  });
}
