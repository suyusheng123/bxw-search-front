<template>
  <Waterfall
    :lazyload="false"
    :breakpoints="breakpoints"
    :gutter="10"
    :list="props.userList"
  >
    <template #item="{ item }">
      <div class="card_content">
        <a-card
          hoverable
          class="card_img"
          @mouseover="hoveredImage = item.userAvatar"
          @mouseleave="hoveredImage = ''"
          @click="previewImage(item.userAvatar)"
        >
          <template #cover>
            <img
              alt="example"
              :src="item.userAvatar"
              :style="getImageStyle(item.userAvatar)"
            />
          </template>
          <a-card-meta :title="item.userName">
            <template #description>{{ item.userProfile }}</template>
          </a-card-meta>
        </a-card>
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
import { withDefaults, defineProps, ref } from "vue";
import { Waterfall } from "vue-waterfall-plugin-next";
import VueEasyLightbox from "vue-easy-lightbox";
import "vue-waterfall-plugin-next/dist/style.css";

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
const visible = ref(false);
const imgs = ref([] as string[]);
const index = ref(0);

const previewImage = (url: string) => {
  // 将props.pictureList的turl全部提取出来，放到一个数组里去
  const urls = props.userList.map((item: any) => item.userAvatar) as string[];
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
      width: "100%", // 确保图片占满整个矩形
      height: "auto", // 保持图片的纵横比
      display: "block", // 确保图片块级显示
    };
  } else {
    return {
      transform: "none",
      transition: "transform 0.3s ease",
      width: "100%", // 确保图片占满整个矩形
      height: "auto", // 保持图片的纵横比
      display: "block", // 确保图片块级显示
    };
  }
};

const handleHide = () => {
  visible.value = false;
};

interface Props {
  userList: any[];
}

const props = withDefaults(defineProps<Props>(), {
  userList: () => [],
});
</script>
<style lang="scss" scoped>
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
