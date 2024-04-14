/* 

游戏的配置文件

*/
var config = {
  easy: {
    row: 10,
    col: 10,
    mineNum: 10,
  },
  normal: {
    row: 15,
    col: 15,
    mineNum: 30,
  },
  hard: {
    row: 20,
    col: 20,
    mineNum: 60,
  },
};

// 当前游戏难度，一开始 easy
var curLevel = config.easy;
