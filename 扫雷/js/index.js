/* 
游戏主要逻辑
*/

// 存储生成的地雷数组
var mineArray = null;

// 获取到雷区的容器
var mineArea = $('.mineArea');
// 用于获取整张地图
var tableData = [];

// 用于存储用户插旗的 DOM 元素
var flagArr = [];

// 初始化格子的下标
var index = 0;
// 是否全部添加正确
var isAllright = true;

// 获取游戏难度选择的所有按钮
var btns = $$('.level>button');

// 插旗数量的DOM
var flagNum = $('.flagNum');
// 当前级别雷数
var mineNumber = $('.mineNum');
/* 
生成地雷的方法
返回地雷数组
*/
function initMine() {
  // 1. 生成对应长度的数组
  var arr = new Array(curLevel.row * curLevel.col);
  // 2. 向数组中填充值
  for (let i = 0; i < arr.length; i++) {
    arr[i] = i;
  }
  // 打乱原来的数组
  arr.sort(() => 0.5 - Math.random());
  // 截取对应雷数量的数组长度

  return arr.slice(0, curLevel.mineNum);
}
// 场景重置
function clearScene() {
  mineArea.innerHTML = '';
  flagArr = [];
  // 重置插旗的数量为0
  flagNum.innerHTML = 0;
  // 重置当前级别的雷数
  mineNumber.innerHTML = curLevel.mineNum;
}
/* 
游戏初始化
*/
function init() {
  // 点击不同位置的内容的时候，清空场景或者重写信息
  clearScene();
  // 1. 随机生成所选配置对应数量的雷
  mineArray = initMine();
  // console.log(mineArray);
  // 2. 生成所选配置的表格
  var table = document.createElement('table');

  // 初始化格子的下标
  var index = 0;

  for (let i = 0; i < curLevel.row; i++) {
    // 创新新的一行
    var tr = document.createElement('tr');
    tableData[i] = [];
    for (var j = 0; j < curLevel.col; j++) {
      var td = document.createElement('td');
      var div = document.createElement('div');

      // 每一个小格子都会对应一个JS对象
      // 该对象存储了额外的一些信息

      tableData[i][j] = {
        row: i, // 该格子的行
        col: j, // 该格子的列
        type: 'number', // 格子的属性 数字：number 雷:mine
        value: 0, // 周围雷的数量
        index, // 格子的下标
        checked: false, // 是否被检验过
      };
      // 为每一个 div添加一个下标，方便用户点击的时候获取对应格子的对应下标
      div.dataset.id = index;
      // 标记当前的格子是可以插旗的
      div.classList.add('canFlag');

      // 查看当前格子的下标是否在雷的数组里面
      if (mineArray.includes(tableData[i][j].index)) {
        tableData[i][j].type = 'mine';
        div.classList.add('mine');
      }

      td.appendChild(div);
      tr.appendChild(td);

      // 下标自增
      index++;
    }
    table.appendChild(tr);
  }
  // console.log(table);
  mineArea.appendChild(table);
  // console.log(tableData);
  // 每次初始化的时候重新绑定一下事件，因为每次游戏结束的时候移除了事件
  // 注意使用的是mouseDown 不是click

  mineArea.onmousedown = function (e) {
    // console.log(e.button);
    // e.button 左键点击是 0 右键点击是 2
    if (e.button === 0) {
      // 用户点击的鼠标左键，进行区域搜索操作
      searchArea(e.target);
    }
    if (e.button === 2) {
      // 用户点击的鼠标右键，进行插旗操作
      flag(e.target);
    }
  };
}

/* 
cell 代表用户点击的DOM元素
核心思路：
1.如果点击的是雷，直接结束游戏
2. 当前单元格不是雷， 判断周围一圈有没有雷
  如果没有雷继续递归搜素
*/
function searchArea(cell) {
  if (cell.classList.contains('mine')) {
    // 进入此逻辑证明踩雷了
    cell.classList.add('error');
    showAnswer();
    return;
  }
  // 如果没有踩雷就获取周围的九宫格
  getArround(cell);
}

/* 
判断玩家插旗是否全部正确
如果插旗正确的话 上面既有mine 又有 flag，错误的话就不包含 mine 的样式类
*/
function isWin() {
  for (var i = 0; i < flagArr.length; i++) {
    if (!flagArr[i].classList.contains('mine')) {
      return false;
    }
  }
  return true;
}
/* 
分为两种情况
1.全部插对，游戏胜利
2.有差错的，游戏失败
参数 isWin 是一个布尔值，true 代表游戏胜利
false 代表游戏失败
*/
function gameOver(isWin) {
  var mess = '';
  if (isWin) {
    mess = '游戏胜利，你找出了所有的雷！！！';
  } else {
    mess = '游戏失败~';
  }
  // 可以先插旗后显示消息提示
  setTimeout(function () {
    window.alert(mess);
  }, 0);
}
/* 插旗操作 */
function flag(cell) {
  // console.log(cell);
  // 如果点击的DOM包含canFlag才能执行插旗的样式
  // 右键重复点击插旗取消
  if (cell.classList.contains('canFlag')) {
    if (!flagArr.includes(cell)) {
      // 进行插旗操作
      flagArr.push(cell);
      cell.classList.add('flag');
      // 进行插旗数的判断
      if (flagArr.length === curLevel.mineNum) {
        // 判断玩家是否胜利
        if (isWin()) {
          gameOver(true);
        }
        // 无论游戏胜利还是失败都应该进入 showAnswer 显示最终答案
        showAnswer();
      }
    } else {
      // 说明这个单元格已经在了
      // 用户现在是要取消插旗
      var index = flagArr.indexOf(cell);
      flagArr.splice(index, 1);
      cell.classList.remove('flag');
    }

    flagNum.innerHTML = flagArr.length;
  }
}

// 会返回该对象对应的四周边界
function getBound(obj) {
  // 确定边界
  // 上下边界的确定
  var rowTop = obj.row - 1 < 0 ? 0 : obj.row - 1;
  // 不能写死因为不同level 的行列数不同
  var rowBottom = obj.row + 1 === curLevel.row ? curLevel.row - 1 : obj.row + 1;
  // 左右边界
  var colLeft = obj.col - 1 < 0 ? 0 : obj.col - 1;
  var colRight = obj.col + 1 === curLevel.col ? curLevel.col - 1 : obj.col + 1;

  return {
    rowTop,
    rowBottom,
    colLeft,
    colRight,
  };
}

// 接受一个js对象返回累的数量
// 返回周围的雷的数量
function findMineNum(obj) {
  // 进行边界判断
  let mineNum = 0;
  var { rowTop, rowBottom, colLeft, colRight } = getBound(obj);
  for (var i = rowTop; i <= rowBottom; i++) {
    for (var j = colLeft; j <= colRight; j++) {
      if (tableData[i][j].type === 'mine') {
        mineNum++;
      }
    }
  }
  return mineNum;
}

// 根据tableData 中的js对象返回对应的div
function getDOM(obj) {
  var divArray = $$('td>div');
  return divArray[obj.index];
}

// cell 接受用户点击的单元格，搜索剩余的九宫格
function getArround(cell) {
  // 如果所搜索的单元格已经被插旗了就不再对该单元格进行操作
  if (!cell.classList.contains('flag')) {
    cell.parentNode.style.border = 'none';
    cell.classList.remove('canFlag');
    // DOM 元素在tableData 中等对应的对象
    var tableItem = getTableItem(cell);
    // console.log(tableItem);
    // 但是用户点击边界可能返回 undefined
    if (!tableItem) {
      return;
    }
    // 当前的单元格已经被查看
    tableItem.checked = true;
    // 得到对应的DOM对象所对应的JS对象，可以查看周围一圈是否有雷
    var mineNum = findMineNum(tableItem);
    if (!mineNum) {
      // 如果周围没有雷则继续搜索
      var { rowTop, rowBottom, colLeft, colRight } = getBound(tableItem);
      for (var i = rowTop; i <= rowBottom; i++) {
        for (var j = colLeft; j <= colRight; j++) {
          // tableData[i][j] 是js 的对象但是getAround需要的是对应的单元格
          // getArround(getDOM(tableData[i][j]));
          if (!tableData[i][j].checked) {
            getArround(getDOM(tableData[i][j]));
          }
        }
      }
    } else {
      // 周围有雷，当前格子显示对应雷的数量
      var cl = [
        'zero',
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
      ];
      cell.classList.add(cl[mineNum]);
      cell.innerHTML = mineNum;
    }
  }
}
// 找到 对应 DOM 在 tableData 中的 JS 对象
// 对应的 div 上有 data-id
function getTableItem(cell) {
  var index = cell.dataset.id;
  // console.log(index);
  // console.log(tableData);
  // 二维数组转换为一维数组
  var flatTableData = tableData.flat();
  // 获得所选中单元格对象
  return flatTableData.filter((item) => item.index == index)[0];
}

/* 显示答案 */
function showAnswer() {
  // 把所有的雷显示出来
  // 有些雷可能是插了旗的，如果插旗正确，添加绿色背景，如果是错误的则添加红色背景

  // 获取雷的DOM元素
  var mineArr = $$('td>div.mine');
  for (var i = 0; i < mineArr.length; i++) {
    mineArr[i].style.opacity = 1;
  }
  // 遍历玩家的插旗
  for (var i = 0; i < flagArr.length; i++) {
    if (flagArr[i].classList.contains('mine')) {
      // 说明插旗插对了添加绿色否则添加红色
      flagArr[i].classList.add('right');
    } else {
      flagArr[i].classList.add('error');
      isAllright = false;
    }
  }
  if (!isAllright || flagArr.length !== curLevel.mineNum) {
    gameOver(false);
  }
  // 取消事件
  mineArea.onmousedown = null;
}

/* 
绑定事件
*/
function bindEvent() {
  // 阻止默认的鼠标右键的行为
  // 鼠标右键点击出现右键菜单
  mineArea.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // 游戏难度选择
  $('.level').onclick = function (e) {
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove('active');
    }
    e.target.classList.add('active');
    switch (e.target.innerHTML) {
      case '初级': {
        curLevel = config.easy;
        break;
      }
      case '中级': {
        curLevel = config.normal;
        break;
      }
      case '高级': {
        curLevel = config.hard;
        break;
      }
    }
    init();
    s;
  };
}

function main() {
  // 1. 游戏初始化
  init();
  // 2. 绑定事件
  bindEvent();
}
main();
