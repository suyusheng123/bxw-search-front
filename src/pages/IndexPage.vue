<template>
  <div class="index-page">
    <div class="fixed-container">
      <div class="search-container">
        <a-auto-complete
          v-model:value="searchText"
          :options="options ?? []"
          class="autocomplete"
          placeholder="请输入关键字"
          @select="onSearch"
          @search="getSuggestDebounce"
          :allow-clear="true"
          :open="isDropdownVisible"
          :getPopupContainer="(triggerNode) => triggerNode.parentNode"
          @keydown.enter="handleEnterKey"
          :default-active-first-option="false"
        >
          <template #clearIcon>
            <CloseOutlined
              :style="{
                'background-color': 'transparent',
                border: 'none',
                color: 'blue',
                'font-size': '17px',
              }"
            />
          </template>
        </a-auto-complete>
        <a-button size="large" @click="onSearch">搜索</a-button>
      </div>
    </div>

    <my-divider />
    <!-- tab组件切换路由绑定chage事件-->
    <a-tabs
      defaultActiveKey="post"
      v-model:activeKey="activeKey"
      @change="onTabChange"
      size="large"
    >
      <a-tab-pane key="post" tab="文章">
        <div class="container" id="main">
          <PostList :post-list="postList" />
          <div class="loading-text" v-if="loading">加载中...</div>
          <div class="loading-text" v-if="finish">没有更多了</div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="user" tab="用户">
        <div class="container" id="main">
          <UserList :user-list="userList" />
          <div class="loading-text" v-if="loading">加载中...</div>
          <div class="loading-text" v-if="finish">没有更多了</div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="picture" tab="图片">
        <div class="container" id="main">
          <PictureList :picture-list="pictureList" />
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
import myDenounce from "@/plugins/myDenounce";
import myThrottle from "@/plugins/Throttle";
import { CloseOutlined } from "@ant-design/icons-vue";

// 添加一个响应式变量来控制下拉框的显示状态
const isDropdownVisible = ref(false);
const isSearching = ref(false); // 确保搜索框只能触发一次
const postList = ref([]); // 文章列表
const userList = ref([]); // 用户列表
const pictureList = ref([]); // 图片列表
const loading = ref(false);
const finish = ref(false);
const route = useRoute(); // 将url同步到页面上
const router = useRouter(); // 将页面信息同步到url上
let activeKey = route.params.category; //将url上的标签key绑定在页面的标签上
// 抽象出一个初始变量,用来记录查询的初始参数
const initSearchParams = {
  text: "",
  pageNum: 1,
  pageSize: 20,
  type: activeKey,
  sortField: "updateTime",
  sortOrder: "desc",
};
const searchText = ref(route.query.text);
const searchParams = ref(initSearchParams); // 抽象出一个变量,用来记录传入url上的参数
const options = ref<any[]>([]);

/**
 * 搜索建议
 */
const getSuggest = (value: string) => {
  options.value = [];
  if (value == null || value == "") {
    return;
  }
  searchText.value = value;
  console.log(searchText.value);
  myAxios
    .get("/search/suggest?keyword=" + searchText.value)
    .then((res: any) => {
      if (res) {
        res.map((suggest: any) => {
          const tempMap = {
            label: suggest.title,
            value: suggest.title,
          };
          isDropdownVisible.value = true;
          options.value.push(tempMap);
        });
      }
    })
    .catch((e: any) => {
      throw new Error(e);
    });
};

/**
 * 获取搜索建议-防抖
 */
const getSuggestDebounce = myDenounce(getSuggest, 200);

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
    type: params.type,
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
      isSearching.value = false;
      throw new Error(error);
    });
};

// 监听
watchEffect(() => {
  searchParams.value = {
    ...initSearchParams,
    text:
      route.query.text === null || route.query.text === undefined
        ? ""
        : (route.query.text as string),
    type:
      route.params.category === null || route.params.category === undefined
        ? "post"
        : route.params.category,
  };
});

const onSearch = () => {
  isSearching.value = true;
  isDropdownVisible.value = false;
  //url 拼接搜索条件
  router
    .push({
      query: {
        ...searchParams.value,
        text: searchText.value,
      },
    })
    .then(() => {
      loadData(searchParams.value);
      // 搜索完成后，清除锁变量
      isSearching.value = false;
      window.location.reload();
    });
};
// 输入框keydown事件处理函数
const handleEnterKey = (event: KeyboardEvent) => {
  if (!isSearching.value) {
    event.preventDefault(); // 防止默认行为，如提交表单
    onSearch(); // 执行搜索操作
  }
};

const onTabChange = (key: string) => {
  searchParams.value.pageNum = 1;
  searchParams.value.type = key;
  router.push({
    path: `/${key}`,
    query: searchParams.value, //搜索参数
  });
  loadData(searchParams.value);
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
  isDropdownVisible.value = false;
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
  let element = document.querySelector(".fixed-container");
  console.log(scrollTop);
  if (!element) return;
  if (scrollTop === 0) {
    element.style.boxShadow = "none";
  } else {
    element.style.boxShadow =
      "rgb(14 14 13 / 37%) 0px 10px 10px 1px"; /* 阴影效果 */
  }
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

onMounted(() => {
  loadData(searchParams.value);
  window.addEventListener("scroll", myThrottle(handleScroll, 500));
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style lang="scss" scoped>
.custom-dropdown-menu {
  max-height: 200px; /* 设置最大高度 */
  overflow-y: auto;
}

.custom-dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-dropdown-menu li {
  line-height: 24px; /* 与上面的 lineHeight 对应 */
}

.fixed-container {
  position: fixed; /* 固定定位 */
  top: 0; /* 顶部对齐 */
  left: 0; /* 左侧对齐 */
  right: 0; /* 右侧对齐 */
  z-index: 1000; /* 确保在最顶层 */
  background-color: white; /* 背景色 */
}

/* 由于搜索框现在是固定定位，需要调整页面的其他部分，避免被搜索框遮挡 */
.index-page {
  padding-top: 20px; /* 根据搜索框的高度调整 */
}

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px; /* 移除最大宽度限制 */
  margin: 0 auto; /* 居中 */
  padding: 12px; /* 内边距 */
}

.autocomplete {
  flex-grow: 1;
  margin-right: 0; // 调整输入框与按钮之间的间隔

  :deep(.ant-select-selector) {
    border: 3px solid #4e6ef2; // 设置边框颜色为蓝色
    border-radius: 4px 0 0 4px; // 设置左边界圆角
    height: 40px;
  }

  :deep(.ant-select-selector .ant-select-selection-search-input) {
    margin-top: 3px;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;
    appearance: none;
  }

  // 覆盖输入框的边框样式
  :deep(.ant-select-selector .ant-select-selection-placeholder) {
    padding: 0;
    line-height: 33px;
    transition: all 0.3s;
  }
}

// 为a-button添加蓝色背景
:deep(.search-container .ant-btn) {
  background-color: #4e6ef2;
  color: white;
  border: none;
  border-radius: 4px 4px 4px 0;
  margin-left: -5px;
}

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
