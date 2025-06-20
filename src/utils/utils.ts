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

// 计算中心
export function getGeoJSONCenter(geojson) {
  let lngSum = 0,
    latSum = 0,
    count = 0;
  geojson.features.forEach(f => {
    const coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates.flat() : f.geometry.coordinates.flat(2);
    coords.forEach(([lng, lat]) => {
      lngSum += lng;
      latSum += lat;
      count++;
    });
  });
  return [lngSum / count, latSum / count];
}

// 旋转
export function rotateGeoJSON(geojson, angle, center) {
  const data = JSON.parse(JSON.stringify(geojson));
  const rad = (angle * Math.PI) / 180;
  function rotateCoord(coord) {
    return coord.map(([lng, lat]) => {
      const x = lng - center[0];
      const y = lat - center[1];
      const newX = x * Math.cos(rad) - y * Math.sin(rad);
      const newY = x * Math.sin(rad) + y * Math.cos(rad);
      return [newX + center[0], newY + center[1]];
    });
  }
  data.features.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      f.geometry.coordinates = f.geometry.coordinates.map(ring => rotateCoord(ring));
    } else if (f.geometry.type === 'MultiPolygon') {
      f.geometry.coordinates = f.geometry.coordinates.map(poly => poly.map(ring => rotateCoord(ring)));
    }
  });
  return data;
}
