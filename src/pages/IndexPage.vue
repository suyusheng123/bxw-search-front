<template>
  <div>
    <div class="fixed-container">
      <div class="emoji-container">
        <span class="title-class">
          坤
          <BugTwoTone
            :style="{
              'background-color': 'transparent',
              border: 'none',
              'font-size': '25px',
            }"
          />
          猎手
        </span>
      </div>
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
    <div class="index-page">
      <!-- tab组件切换路由绑定chage事件-->
      <a-tabs
        defaultActiveKey="article"
        v-model:activeKey="activeKey"
        @change="onTabChange"
        size="large"
      >
        <a-tab-pane key="article" tab="文章">
          <ArticleList
            :article-list="articleList"
            :loading="pageLoading"
            :pagination="pagination"
            :is-highlight="isHighlight"
            :search-text="route.query.text ? String(route.query.text) : ''"
          />
        </a-tab-pane>
        <a-tab-pane key="video" tab="视频">
          <VideoList
            :video-list="videoList"
            :loading="pageLoading"
            :pagination="pagination"
            :is-highlight="isHighlight"
            :search-text="route.query.text ? String(route.query.text) : ''"
          />
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
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import ArticleList from "@/components/ArticleList.vue";
import PictureList from "@/components/PictureList.vue";
import VideoList from "@/components/VideoList.vue";
import { watchEffect } from "vue";
// 引入自定义GIF
// 这是vue-router自带的函数必须写useRouter函数，不能修改，useRouter将页面信息同步到url上

// useRoute将url信息同步到页面上
import { useRouter, useRoute } from "vue-router";
import myAxios from "@/plugins/myAxios";
import { onMounted } from "vue";
import myDenounce from "@/plugins/myDenounce";
import myThrottle from "@/plugins/Throttle";
import { CloseOutlined } from "@ant-design/icons-vue";
import { BugTwoTone } from "@ant-design/icons-vue";

// 添加一个响应式变量来控制下拉框的显示状态
const isDropdownVisible = ref(false);
const isSearching = ref(false); // 确保搜索框只能触发一次
const articleList = ref([]); // 文章列表
const pictureList = ref([]); // 图片列表
const videoList = ref([]); // 视频列表
const loading = ref(false); // 下拉状态显示字段
const finish = ref(false);
const pageLoading = ref(false);
const route = useRoute(); // 将url同步到页面上
const router = useRouter(); // 将页面信息同步到url上
const isHighlight = ref(0);
let activeKey = route.params.category; //将url上的标签key绑定在页面的标签上
// 抽象出一个初始变量,用来记录查询的初始参数
const initSearchParams = {
  text: "",
  pageNum: 1,
  pageSize: 10,
  type: "",
  sortField: "id",
  sortOrder: "descend",
  scrollPageNum: 1,
};
const searchText = ref("");
const searchParams = ref(initSearchParams); // 抽象出一个变量,用来记录传入url上的参数
const options = ref<any[]>([]);
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
  if (!element) return;
  if (scrollTop === 0) {
    element.style.boxShadow = "none";
  } else {
    element.style.boxShadow =
      "rgb(14 14 13 / 37%) 0px 10px 10px 1px"; /* 阴影效果 */
  }
  if (
    clientHeight + scrollTop >= scrollHeight &&
    searchParams.value.scrollPageNum <= 10 &&
    searchParams.value.type === "picture"
  ) {
    //快到底时----加载
    console.log(clientHeight + scrollTop, scrollHeight);
    searchParams.value.scrollPageNum++;
    console.log(searchParams.value.scrollPageNum);
    loadData(searchParams.value);
  }
};
let isScrollEventAdded = false; // 标志变量，用来追踪是否添加了滚动事件监听器
let throttledHandleScroll = myThrottle(handleScroll, 800);
// 监听
watchEffect(() => {
  searchText.value = route.query.text ? String(route.query.text) : "";
  searchParams.value = {
    ...initSearchParams,
    pageNum: route.query.pageNum ? Number(route.query.pageNum) : 1,
    scrollPageNum: route.query.scrollPageNum
      ? Number(route.query.scrollPageNum)
      : 1,
    text: route.query.text ? String(route.query.text) : "",
    type: route.params.category ? String(route.params.category) : "article",
  };
  // 根据当前标签页类型决定是否添加或移除滚动事件监听器
  if (!isScrollEventAdded) {
    // 添加滚动事件监听器
    window.addEventListener("scroll", throttledHandleScroll);
    isScrollEventAdded = true;
  }
});

const pagination = {
  onChange: (page: number) => {
    pageNumChange(page);
  },
  current: Number(searchParams.value.pageNum),
  pageSize: initSearchParams.pageSize,
  total: 0,
  showSizeChanger: false,
};

/**
 * 切换页面函数
 */
const pageNumChange = (page: number) => {
  searchParams.value.pageNum = page;
  searchParams.value.text = searchText.value as string;
  pagination.current = page;
  router.push({
    query: searchParams.value,
  });
  loadData(searchParams.value);
};
/**
 * 搜索建议
 */
const getSuggest = (value: string) => {
  options.value = [];
  if (value == null || value == "") {
    return;
  }
  searchText.value = value ? value.replace(/\s+/g, "") : "";
  // searchText.value = value;
  // console.log(searchText.value);
  myAxios
    .get("/search/suggest?keyword=" + searchText.value)
    .then((res: any) => {
      if (res) {
        res.map((suggest: any) => {
          isDropdownVisible.value = true;
          let suggestObj = {
            value: suggest,
          };
          // 截取前8条
          options.value.push(suggestObj);
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

const onSearch = () => {
  isSearching.value = true;
  isDropdownVisible.value = false;
  searchParams.value.pageNum = 1;
  searchParams.value.scrollPageNum = 1;
  searchParams.value.text = String(searchText.value);
  pagination.total = 0;
  pagination.current = 1;
  // 搜索
  // 置空所有数据
  articleList.value = [];
  pictureList.value = [];
  videoList.value = [];
  //url 拼接搜索条件
  router
    .push({
      query: {
        ...searchParams.value,
        text: searchText.value,
        pageNum: 1,
        scrollPageNum: 1,
      },
    })
    .then(() => {
      loadData(searchParams.value);
      // 搜索完成后，清除锁变量
      isSearching.value = false;
    });
};
// 输入框keydown事件处理函数
const handleEnterKey = (event: KeyboardEvent) => {
  if (!isSearching.value) {
    event.preventDefault(); // 防止默认行为，如提交表单
    onSearch(); // 执行搜索操作
  }
};

// const trimSearchText = (event: any) => {
//   searchText.value = event ? event.target.value.replace(/\s+/g, "") : "";
// };

const onTabChange = (key: string) => {
  searchParams.value.type = key;
  searchParams.value.text = searchText.value as string;
  searchParams.value.pageNum = 1;
  searchParams.value.scrollPageNum = 1;
  pagination.current = 1;
  pagination.pageSize = key === "video" ? 12 : 10;
  pagination.total = 0;
  // 置空所有数据
  articleList.value = [];
  pictureList.value = [];
  videoList.value = [];
  router.push({
    path: `/${key}`,
    query: searchParams.value, //搜索参数
  });
  loadData(searchParams.value);
};

/**
 * 请求文章列表，用户列表，图片列表
 */
const loadData = (params: any) => {
  if (params.type === "article" || params.type === "video") {
    pageLoading.value = true;
  } else {
    loading.value = true;
    finish.value = false;
  }
  const queryData = {
    current: params.type === "picture" ? params.scrollPageNum : params.pageNum,
    pageSize: params.type === "video" ? 12 : params.pageSize,
    searchText: params.text,
    type: params.type,
    sortField: "updateTime",
    sortOrder: "desc",
  };
  if (searchParams.value.scrollPageNum > 10) {
    loading.value = false;
    finish.value = true;
    return;
  }
  // 聚合接口请求
  myAxios
    .post("search/async", queryData)
    .then((res) => {
      if (queryData.type === "picture") {
        pictureList.value = res.dataList
          ? [...pictureList.value, ...(res.dataList as [])]
          : [];
        finish.value = !res.dataList;
      } else if (queryData.type === "video") {
        pagination.total = Number(res.total);
        // videoList.value = res.dataList
        //   ? [...videoList.value, ...(res.dataList as [])]
        //   : [];
        videoList.value = res.dataList ?? [];
        pagination.current = Number(res.current);
        pagination.pageSize = 12;
        isHighlight.value = Number(res.isHighlight);
      } else if (queryData.type === "article") {
        pagination.total = Number(res.total);
        // articleList.value = res.dataList
        //   ? [...articleList.value, ...(res.dataList as [])]
        //   : [];
        isHighlight.value = Number(res.isHighlight);
        articleList.value = res.dataList ?? [];
        pagination.current = Number(res.current);
        pagination.pageSize = 10;
        console.log(articleList.value);
      }
      loading.value = false;
      pageLoading.value = false;
    })
    .catch((error: any) => {
      pageLoading.value = false;
      loading.value = false;
      finish.value = true;
      isSearching.value = false;
      // 置空所有数据
      articleList.value = [];
      pictureList.value = [];
      videoList.value = [];
      throw new Error(error);
    });
};
onMounted(() => {
  loadData(searchParams.value);
});

onUnmounted(() => {
  if (isScrollEventAdded) {
    window.removeEventListener("scroll", throttledHandleScroll);
  }
});
</script>

<style lang="scss" scoped>
.title-class {
  font-size: 25px;
  background: linear-gradient(58deg, #4096ff, #1677ff, #0000ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.emoji-container {
  text-align: center; /* 居中显示emoji */
  margin-top: 20px; /* 与搜索框保持一定的距离 */
  /* 其他样式根据需要进行添加 */
}

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
  margin-top: 35px;
  padding-top: 35px;
}

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 65%; /* 移除最大宽度限制 */
  margin: 0 auto; /* 居中 */
  padding: 0 0 10px 0;
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
