<template>
  <!-- 自定义加载动画 -->
  <a-spin
    :indicator="customLoadingIndicator"
    :spinning="props.loading"
    class="loading-container"
  >
    <div class="article-list">
      <a-row v-if="!props.loading" style="margin-left: 23px; font-weight: bold">
        为您找到相关结果约
        <span>{{ String(props.pagination?.total) }}</span>
        条记录
      </a-row>
      <a-list
        item-layout="vertical"
        :pagination="props.pagination"
        :data-source="props.articleList ?? []"
        :loading="false"
      >
        <template #renderItem="{ item }">
          <a-list-item :key="item.id">
            <a-skeleton :loading="props.loading" active avatar>
              <a-list-item-meta>
                <template #title>
                  <span class="title"
                    ><a
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span v-if="props.isHighlight" v-html="item.title"></span>
                      <span
                        v-else
                        v-html="parseTextToHtml(props.searchText, item.title)"
                      ></span></a
                  ></span>
                </template>
                <template #description>
                  <div class="content">
                    <span>
                      <span
                        v-if="props.isHighlight"
                        v-html="item.content"
                      ></span>
                      <span
                        v-else
                        v-html="parseTextToHtml(props.searchText, item.content)"
                      ></span>
                    </span>
                  </div>
                  <div class="link">
                    <span class="link-text"
                      ><a
                        :href="item.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ item.url }}</a
                      ></span
                    >
                    <div style="float: right">
                      <span class="publishTime">{{
                        formatPublishTime(item.publishTime)
                      }}</span>
                    </div>
                  </div>
                </template>
              </a-list-item-meta>
            </a-skeleton>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults, h } from "vue";
import { segmentText } from "@/plugins/Segmenter";
import loadingGif from "@/assets/gege.gif";

interface Props {
  articleList: any[];
  loading: boolean;
  pagination: any;
  isHighlight: number; // 新增的字段
  searchText: string;
}

const props = withDefaults(defineProps<Props>(), {
  articleList: () => [],
  loading: true,
  pagination: {},
  isHighlight: 0,
  searchText: "",
});

// 格式化发布时间的函数
const formatPublishTime = (timeString: string): string => {
  const date = new Date(timeString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}年${month}月${day}日`;
};

// 使用 TinySegmenter 进行分词
const segmentedText = computed(() => {
  return segmentText(props.searchText);
});

const parseTextToHtml = (searchText: string, text: string): string => {
  try {
    if (!searchText) return text;

    // 将分词后的关键字进行高亮
    const escapedKeywordChars = segmentedText.value
      .map((char) => `(${char})`)
      .join("|");
    const regex = new RegExp(escapedKeywordChars, "gi");

    return text.replace(regex, "<font color='red'>$1</font>");
  } catch (error) {
    console.error("Error in parseTextToHtml:", error);
    // 返回原始文本以确保页面能够正常显示
    return text;
  }
};

// 自定义加载动画指示器
const customLoadingIndicator = h("img", {
  src: loadingGif,
  alt: "坤坤加载中...",
  style: {
    width: "200px",
    height: "200px",
    borderRadius: "200px",
  },
});
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 使加载动画垂直居中 */
}

.title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  color: black;
  line-height: 22px;
  margin-top: 5px;
  word-break: break-all;
}

.publishTime {
  margin-right: 10px;
}

.link {
  align-items: center;
  display: flex;
  justify-content: space-between;
  line-height: 2.25rem;
  word-break: break-all;
}

.link-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result {
  margin-left: 25px;
}

.result-num {
  font-weight: bold;
}
</style>
