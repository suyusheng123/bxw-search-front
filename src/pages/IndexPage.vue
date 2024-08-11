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
        <post-list :post-list="postList" />
      </a-tab-pane>
      <a-tab-pane key="user" tab="用户">
        <user-list :user-list="userList" />
      </a-tab-pane>
      <a-tab-pane key="picture" tab="图片">
        <div class="container" id="main">
          <picture-list :picture-list="pictureList" />
          <div class="loading-text" v-if="loading">加载中...</div>
          <div class="loading-text" v-if="finish">没有更多了</div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import PostList from "@/components/PostList.vue";
import UserList from "@/components/UserList.vue";
import PictureList from "@/components/PictureList.vue";
import MyDivider from "@/components/MyDivider.vue";
import { watchEffect } from "vue";
// 这是vue-router自带的函数必须写useRouter函数，不能修改，useRouter将页面信息同步到url上

// useRoute将url信息同步到页面上
import { useRouter, useRoute } from "vue-router";
import myAxios from "@/plugins/myAxios";
import { onMounted } from "vue";

const postList = ref([]); // 文章列表
const userList = ref([]); // 用户列表
const pictureList = ref([]); // 图片列表
const loading = ref(false);
const finish = ref(false);

// 抽象出一个初始变量,用来记录查询的初始参数
const initSearchParams = {
  text: "",
  pageNum: 1,
  pageSize: 35,
};
const searchParams = ref(initSearchParams); // 抽象出一个变量,用来记录传入url上的参数
const route = useRoute(); // 将url同步到页面上

const activeKey = route.params.category; //将url上的标签key绑定在页面的标签上

const router = useRouter(); // 将页面信息同步到url上

// 监听 当刷新页面的时候输入框里的内容不会清除
watchEffect(() => {
  searchParams.value = {
    ...initSearchParams,
    text: route.query.text as string,
  };
});

const onSearch = (value: string) => {
  router
    .push({
      query: searchParams.value,
    })
    .then(() => {
      loadData(searchParams.value);
      window.location.reload();
    });
};

const onTabChange = (key: string) => {
  router.push({
    path: `/${key}`,
    query: searchParams.value,
  });
  loadData(searchParams.value);
};

onMounted(() => {
  loadData(searchParams.value);
  window.addEventListener("scroll", debounce(handleScroll, 100));
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
/**
 * 请求文章列表，用户列表，图片列表
 */
const loadData = (params: any) => {
  const queryData = {
    current: params.pageNum,
    pageSize: params.pageSize,
    searchText: params.text,
  };
  // 文章列表请求
  myAxios.post("post/list/page/vo", queryData).then((res: any) => {
    postList.value = res.records;
  });

  // 用户列表请求
  myAxios.post("user/list/page/vo", queryData).then((res: any) => {
    console.log(res);
    userList.value = res.records;
  });

  // 图片列表请求
  myAxios
    .post("picture/list/page/vo", queryData)
    .then((res) => {
      loading.value = true;
      if (searchParams.value.pageNum > 20) {
        loading.value = false;
        finish.value = true;
      }
      console.log(res);
      pictureList.value = [...pictureList.value, ...(res.records as [])];
    })
    .catch((error: any) => {
      loading.value = false;
      finish.value = true;
      throw new Error(error);
    });
};
const handleScroll = () => {
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  //滚动条滚动距离
  const scrollTop =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;
  //窗口可视范围高度
  const clientHeight =
    window.innerHeight ||
    Math.min(document.documentElement.clientHeight, document.body.clientHeight);
  if (
    clientHeight + scrollTop + 100 >= scrollHeight &&
    searchParams.value.pageNum <= 20
  ) {
    //快到底时----加载
    searchParams.value.pageNum++;
    loadData(searchParams.value);
  }
};

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined = undefined;
  return function (...args: Parameters<T>) {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
</script>

<style lang="scss" scoped>
.loading-text {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  z-index: 999;
  margin: auto;
  padding: 20px 0;
  font-size: 16px;
}

:deep(.waterfall-list) {
  background: none;
}

.container {
  padding: 0 12px;
}
</style>
