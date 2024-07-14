const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,

  // 当出现编译错误或警告时，在浏览器中显示全屏覆盖,以下配置可以关闭全屏
  devServer: {
    client: {
      overlay: false,
    },
  },
});
