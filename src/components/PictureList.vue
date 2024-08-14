<template>
  <Waterfall
    :lazyload="false"
    :breakpoints="breakpoints"
    :gutter="10"
    :list="props.pictureList"
  >
    <template #item="{ item }">
      <div class="card_content">
        <div
          class="card_img"
          @mouseover="hoveredImage = item.turl"
          @mouseleave="hoveredImage = ''"
          @click="previewImage(item.turl)"
        >
          <lazy-img
            alt="example"
            :url="item.turl"
            :style="getImageStyle(item.turl)"
            referrerPolicy="no-referrer"
            crossorigin="true"
          />
        </div>
        <div class="content">
          <a
            :href="item.purl"
            target="_blank"
            class="text-black text-ellipsis"
            :title="item.title"
            >{{ item.title }}</a
          >
        </div>
      </div>
    </template>
  </Waterfall>
  <vue-easy-lightbox
    :visible="visible"
    :imgs="imgs"
    :index="index"
    @hide="handleHide"
  >
  </vue-easy-lightbox>
</template>

<script setup lang="ts">
import { defineProps, ref, withDefaults } from "vue";
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";
import VueEasyLightbox from "vue-easy-lightbox";
import "vue-waterfall-plugin-next/dist/style.css";

const visible = ref(false);
const imgs = ref([] as string[]);
const index = ref(0);
const breakpoints = ref({
  3000: {
    //当屏幕宽度小于等于3000
    rowPerView: 8, // 一行8图
  },
  1200: {
    //当屏幕宽度小于等于1200
    rowPerView: 4,
  },

  500: {
    //当屏幕宽度小于等于500
    rowPerView: 3,
  },
});
const hoveredImage = ref("");

interface Props {
  pictureList: any[];
}

const props = withDefaults(defineProps<Props>(), {
  pictureList: () => [],
});
const previewImage = (url: string) => {
  // 将props.pictureList的turl全部提取出来，放到一个数组里去
  const urls = props.pictureList.map((item: any) => item.turl) as string[];
  console.log(urls);
  imgs.value = urls; // 设置预览图片的URL
  console.log(imgs.value);
  // 搜索我点击的图片在数组中的位置
  index.value = urls.indexOf(url); // 设置预览图片的索引
  visible.value = true; // 显示预览框
};
const getImageStyle = (url: string) => {
  const scaleAmount = 1.1; // 图片放大的比例
  const translateAmount = 5; // 图片平移的距离（像素）
  if (hoveredImage.value === url) {
    return {
      transform: `translate(-${translateAmount}px, -${translateAmount}px) scale(${scaleAmount})`,
      transition: "transform 0.3s ease",
      width: "100%",
      height: "240px",
      display: "block", // 确保图片块级显示
    };
  } else {
    return {
      transform: "none",
      transition: "transform 0.3s ease",
      width: "100%", // 确保图片占满整个矩形
      height: "240px", // 保持图片的纵横比
      display: "block", // 确保图片块级显示
    };
  }
};

const handleHide = () => {
  visible.value = false;
};
</script>
<style lang="scss" scoped>
/* 定义CSS类来设置文字颜色 */
.text-black {
  color: black;
  text-decoration: none;
  white-space: normal; /* 允许文字换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
  display: -webkit-box; /* 使用伸缩盒模型显示 */
  -webkit-line-clamp: 1; /* 限制显示的行数 */
  -webkit-box-orient: vertical; /* 设置伸缩方向为垂直 */
}

/* 当鼠标悬停在链接上时，显示下划线 */
.text-black:hover {
  text-decoration: underline;
}

.card_content {
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;

  .card_img {
    margin-bottom: 7px;
    border-radius: 10px; // 设置圆角的大小
    overflow: hidden; // 确保图片在放大时不会溢出容器
    position: relative; // 为图片提供定位上下文
    display: block; // 使矩形包裹图片
    box-shadow: 2px -2px 4px 0px rgba(28, 62, 198, 0.59);
    height: 240px;
    &.active {
      border: 1px solid #e7e7e7;
    }

    :deep(.lazy__img) {
      width: 100%;
      border-radius: 4px;
      font-size: 0;
      height: 100%;
    }
  }

  .content {
    padding: 0 8px;
  }
}
</style>
