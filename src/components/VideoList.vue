<template>
  <a-spin
    :indicator="customLoadingIndicator"
    :spinning="props.loading"
    class="loading-container"
  >
    <div class="video-list">
      <a-row v-if="!props.loading">
        为您找到相关结果约
        <span>{{ String(props.pagination?.total) }}</span>
        条记录
      </a-row>
      <a-list
        :grid="{ gutter: 8, column: 4 }"
        :pagination="props.pagination"
        :data-source="props.videoList ?? []"
      >
        <template #renderItem="{ item }">
          <a-card
            :hoverable="true"
            style="
              margin-right: 8px;
              margin-bottom: 8px;
              border: 2px solid rgb(78 110 242 / 38%);
            "
          >
            <template #cover>
              <a-skeleton :loading="props.loading" active>
                <div class="video-thumbnail-container">
                  <a :href="item.url" target="_blank" rel="noopener noreferrer">
                    <img
                      class="video-thumbnail"
                      :alt="item.title"
                      :src="item.cover"
                      referrerpolicy="no-referrer"
                    />
                    <i class="video-icon" />
                    <div class="video-background"></div>
                  </a>
                </div>
              </a-skeleton>
            </template>
            <a-card-meta>
              <template #description>
                <a-skeleton :loading="props.loading" active>
                  <a-tooltip :title="item.title">
                    <a
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span class="video-title">
                        <span
                          v-if="props.isHighlight"
                          v-html="item.title"
                        ></span>
                        <span
                          v-else
                          v-html="parseTextToHtml(props.searchText, item.title)"
                        ></span>
                      </span>
                    </a>
                  </a-tooltip>
                </a-skeleton>
              </template>
            </a-card-meta>
          </a-card>
        </template>
      </a-list>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults, h } from "vue";
import "vue-waterfall-plugin-next/dist/style.css";
import { segmentText } from "@/plugins/Segmenter";
import loadingGif from "@/assets/gege.gif";

interface Props {
  videoList: any[];
  loading: boolean;
  pagination: any;
  isHighlight: number;
  searchText: string;
}

const props = withDefaults(defineProps<Props>(), {
  videoList: () => [],
  loading: true,
  pagination: {},
  isHighlight: 0,
  searchText: "",
});

// 使用 TinySegmenter 进行分词
const segmentedText = computed(() => {
  return segmentText(props.searchText);
});

const parseTextToHtml = (searchText: string, text: string) => {
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
.video-thumbnail-container {
  position: relative;
  height: 160px; /* 确保高度固定 */
  border-radius: 8px; /* 添加圆角 */
  overflow: hidden;
}

.video-thumbnail {
  height: 100%;
  display: block;
  object-fit: cover; /* 确保图片覆盖整个容器并保持比例 */
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-title {
  display: block;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长时显示省略号 */
}

.video-icon {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAkCAYAAADo6zjiAAAABGdBTUEAALGPC/xhBQAAA21JREFUWAnFl81OVEEQhUXBfwdRUBl1ZUI0JD4A8QF0wcrENQseQePeBHDpBnkEEoj6BuxcE6IJxA0LEhIggAMhAjKD5wPOWNx7Z5xhBqykpquru+uc2z/VPS3n0tKSdmV69jO9dTojWLQJk6zH0BE82rFPTbZBXDII23WXMZgBKW3THu3Yv6ptgFhio+ePSrcRyKBZJe1IXUQMxkDbAEe1nz4ELwV13aDJkjFVpfWo1SAGviC/1TNBVwMWZaOQYSxlBMeH2HdYy/gluMUkAG7N5XJty8vLb4vF4nfpj/X19Q9DQ0MP1HYxKB+QJOo4airvJeyKwgCItEkvS69LOwT+fj8hIvJzdnb2tdrz0jvSW9Kc9JqUsZAzKc9cJKTmtNCBr4DAFSkBuwS2lMAvV7e2tr6Ojo4+U79uaaf0pvSG9Kr0kpRYEIFEJKJqWugAAdjzJQS7W0arYJRKpV/z8/PD+Xz+If2lzEa7tO7ZMAGYM/0E6q6Am3Jvb29/m5iYeM4YaZe0Q5qcDT6w4mzQwHSZwG3Z91NI1R2/FxcXP/b19T3SWGaDGLXMhrodMjMBmLOmD6rjZbfu7OzMT01NvdJ4NimzwXIyq+wtb9A4E3L/JcAubojAEa3SysrK+MDAwGPF46R4SZIkyqfDS9AsAgc89vb2lqanpwcDCWYCDE6I9wQkDjYHS9BUAl6kjY2NT729vfcUnz3BMWUpzo4ARNbW1sYEylJwRNnsfDAz38LPqUt7e/tLgZTXPAKeCYEImLTPhEChUPgsYG7G1O146gQ2Nze/9Pf3vxO4r+wUEUg0/RRwDGdmZv7LMSytrq6ODw4OPtGH1ZWIOB5kQvL4iVLx7u5uQ6m40ctorJHLiMwEARJF3dfx5OTkC41r6DqGwEkeJCPhQVLrFXyQ/4VXFhwQOPYk0y5ecD5Pls1+kkGAowgBLiQ/SoeTwHonFubm5t6oT9Mfpc4FLAM3Vq6np6dTL+MRgS7o/adkVhjXs/yp2jhaTHd8bLB/4jVLvMzcL/8xcSeXDERZEquDMZAsRkaLf0yoV8pyqdSrvseEDIi4I4EsBjM5/PZFUIO7PZbYVYXgSCwN6C93G/0gUElpR2ivWRzcJQNNwHYymAFMxO32u15TmQSOg2Jb9GNHsGgn+/2zngWS5csK1BCwA/4BfNkp6OaakUkAAAAASUVORK5CYII=)
    no-repeat 50%;
  background-position-x: 60%;
  background-size: 60% auto;
  border: 3px solid #fff;
  border-radius: 45px;
  cursor: pointer;
  height: 45px;
  left: 50%;
  padding: 10px;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 45px;
  z-index: 2;
}

.video-background {
  background-color: rgb(0 0 0 / 32%);
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
}

.result-num {
  font-weight: bold;
}
</style>
