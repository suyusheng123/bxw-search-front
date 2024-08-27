<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
.emoji-container {
  text-align: center; /* 居中显示emoji */
  margin-bottom: 20px; /* 与搜索框保持一定的距离 */
  /* 其他样式根据需要进行添加 */
}

#app {
  padding: 20px;
  max-width: 1024px;
  margin: 0 auto;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
<script setup lang="ts">
import { BugTwoTone } from "@ant-design/icons-vue";
</script>
