<template>
  <!--  <a-list item-layout="horizontal" :data-source="props.pictureList">-->
  <!--    <template #renderItem="{ item }">-->
  <!--      <a-list-item>-->
  <!--        <a-card hoverable style="width: 240px">-->
  <!--          <template #cover>-->
  <!--            <img-->
  <!--              alt="example"-->
  <!--              :src="item.murl"-->
  <!--              style="width: 100%; height: auto"-->
  <!--              referrerPolicy="no-referrer"-->
  <!--            />-->
  <!--          </template>-->
  <!--          <a-card-meta>-->
  <!--            <template #description>-->
  <!--              <a-->
  <!--                :href="item.purl"-->
  <!--                target="_blank"-->
  <!--                class="text-black text-ellipsis"-->
  <!--                :title="item.title"-->
  <!--                >{{ item.title }}}</a-->
  <!--              >-->
  <!--            </template>-->
  <!--          </a-card-meta>-->
  <!--        </a-card>-->
  <!--      </a-list-item>-->
  <!--    </template>-->
  <!--  </a-list>-->
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
</template>

<script setup lang="ts">
import { withDefaults, defineProps, ref } from "vue";
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";
import "vue-waterfall-plugin-next/dist/style.css";

const hoveredImage = ref("");

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

interface Props {
  pictureList: any[];
}

const props = withDefaults(defineProps<Props>(), {
  pictureList: () => [],
});

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
</script>
<style lang="scss" scoped>
.image-zoom-hover {
  transform: scale(1.05); /* 放大图片的百分比 */
}

/* 定义CSS类来设置文字颜色 */
.text-black {
  color: black;
  text-decoration: none;
  white-space: normal; /* 允许文字换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
  display: -webkit-box; /* 使用伸缩盒模型显示 */
  -webkit-line-clamp: 2; /* 限制显示的行数 */
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
    box-shadow: 3px -4px 4px 0px rgba(28, 62, 198, 0.59);

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
