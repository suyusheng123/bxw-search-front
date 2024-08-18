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
        <div class="container" id="main">
          <post-list :post-list="postList" />
          <div class="loading-text" v-if="loading">加载中...</div>
          <div class="loading-text" v-if="finish">没有更多了</div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="user" tab="用户">
        <div class="container" id="main">
          <user-list :user-list="userList" />
          <div class="loading-text" v-if="loading">加载中...</div>
          <div class="loading-text" v-if="finish">没有更多了</div>
        </div>
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
import { Callback } from "vant/lib/lazyload/vue-lazyload";

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
  type: "",
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
    type: route.query.type as string,
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
  searchParams.value.type = key;
  router
    .push({
      path: `/${key}`,
      query: searchParams.value,
    })
    .then(() => {
      searchParams.value.pageNum = 1;
      loadData(searchParams.value);
    });
};
/**
 * 请求文章列表，用户列表，图片列表
 */
const loadData = (params: any) => {
  loading.value = true;
  finish.value = false;
  const queryData = {
    current: params.pageNum,
    pageSize: params.pageSize,
    searchText: params.text,
    type:
      params.type === null || params.type === undefined ? "post" : params.type,
  };
  if (searchParams.value.pageNum > 10) {
    loading.value = false;
    finish.value = true;
    return;
  }
  // 聚合接口请求
  myAxios
    .post("search/all", queryData)
    .then((res) => {
      if (res.dataList !== null) {
        if (queryData.type === "picture") {
          if (res.dataList.length === 0) {
            loading.value = false;
            finish.value = true;
            return;
          }
          pictureList.value = [...pictureList.value, ...(res.dataList as [])];
        } else if (queryData.type === "post") {
          if (!judgeList(res, postList)) return;
        } else if (queryData.type === "user") {
          if (!judgeList(res, userList)) return;
        }
      } else {
        loading.value = false;
        finish.value = true;
      }
    })
    .catch((error: any) => {
      loading.value = false;
      finish.value = true;
      throw new Error(error);
    });
};
/**
 * 判断是哪个集合的数据(用户和帖子)
 * @param res
 * @param list
 */
const judgeList = (res: any, list: any) => {
  if (res.dataList.length === 0 || Number(res.total) === list.value.length) {
    loading.value = false;
    finish.value = true;
    return false;
  }
  list.value = [...list.value, ...(res.dataList as [])];
  if (Number(res.total) === list.value.length) {
    loading.value = false;
    finish.value = true;
    return false;
  }
  return true;
};
const handleScroll = () => {
  const scrollHeight = Math.min(
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
    Math.max(document.documentElement.clientHeight, document.body.clientHeight);
  if (
    clientHeight + scrollTop >= scrollHeight &&
    searchParams.value.pageNum <= 10
  ) {
    //快到底时----加载
    console.log(clientHeight + scrollTop, scrollHeight);
    searchParams.value.pageNum++;
    console.log(searchParams.value.pageNum);
    loadData(searchParams.value);
  }
};

/**
 * 创建一个节流函数,确保在滚动的时候在规定的时间内只执行一次
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle = true;
  return function (this: any, ...args: Parameters<T>) {
    if (inThrottle) {
      inThrottle = false;
      setTimeout(() => {
        func.apply(this, args);
        inThrottle = true;
      }, limit);
    }
  } as T;
}

onMounted(() => {
  loadData(searchParams.value);
  window.addEventListener("scroll", throttle(handleScroll, 800));
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
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
