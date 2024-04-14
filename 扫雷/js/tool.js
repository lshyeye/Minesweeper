/* 工具函数 */

// 获取 DOM 元素
// $ 就是一个函数名进行直接调用 $()即可
function $(selector) {
  return document.querySelector(selector);
}
// querySelector只返回第一个符合要求的
function $$(selector) {
  return document.querySelectorAll(selector);
}
