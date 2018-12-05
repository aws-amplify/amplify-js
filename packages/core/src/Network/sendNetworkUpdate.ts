/**
 * MIT License
 * 
 * Copyright (c) 2017 Jani Eväkallio
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/* global window */
const handle = (callback, online) => {
    // NetInfo is not supported in browsers, hence we only pass online status
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => callback({ online }));
    } else {
      setTimeout(() => callback({ online }), 0);
    }
  };
  
  export default callback => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => handle(callback, true));
      window.addEventListener('offline', () => handle(callback, false));
      handle(callback, window.navigator.onLine);
    }
  };

