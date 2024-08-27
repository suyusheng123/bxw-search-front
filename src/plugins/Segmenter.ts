// utils/segmenter.ts
import TinySegmenter from "tiny-segmenter";

const segmenter = new TinySegmenter();

/**
 * 使用 TinySegmenter 对文本进行分词
 * @param text 需要分词的文本
 * @returns 分词结果的数组
 */
export const segmentText = (text: string): string[] => {
  return segmenter.segment(text);
};
