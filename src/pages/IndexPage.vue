<template>
  <div class="index-page">
    <a-input-search
      v-model:value="searchParams.text"
      placeholder="input search text"
      enter-button="Search"
      size="large"
      @search="onSearch"
    />

    <my-divider />
    <!-- tab组件切换路由绑定chage事件-->
    <a-tabs v-model:activeKey="activeKey" @change="onTabChange">
      <a-tab-pane key="post" tab="文章">
        <post-list />
      </a-tab-pane>
      <a-tab-pane key="user" tab="用户">
        <user-list />
      </a-tab-pane>
      <a-tab-pane key="picture" tab="图片">
        <picture-list />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PostList from "@/components/PostList.vue";
import UserList from "@/components/UserList.vue";
import PictureList from "@/components/PictureList.vue";
import MyDivider from "@/components/MyDivider.vue";
import { watchEffect } from "vue";
// 这是vue-router自带的函数必须写useRouter函数，不能修改，useRouter将页面信息同步到url上

// useRoute将url信息同步到页面上
import { useRouter, useRoute } from "vue-router";

// 将url同步到页面上
const route = useRoute();

//将url上的标签key绑定在页面的标签上
const activeKey = route.params.category;

// 将页面信息同步到url上
const router = useRouter();

// 抽象出一个初始变量,用来记录查询的初始参数
const initSearchParams = {
  text: "",
  pageNum: 1,
  pageSize: 10,
};

// 抽象出一个变量,用来记录传入url上的参数
const searchParams = ref(initSearchParams);

// 监听 当刷新页面的时候输入框里的内容不会清除
watchEffect(() => {
  searchParams.value = {
    ...initSearchParams,
    text: route.query.text as string,
  };
});
const onSearch = (value: string) => {
  router.push({
    query: searchParams.value,
  });
};

const onTabChange = (key: string) => {
  router.push({
    path: `/${key}`,
    query: searchParams.value,
  });
};
</script>
