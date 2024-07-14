import { message } from "ant-design-vue";
import axios from "axios";

// 弹窗消息配置
message.config({
  duration: 1.5, // 提示时常单位为s
  maxCount: 3, // 最多显示提示信息条数(后面的会替换前面的提示)
});
const instance = axios.create({
  baseURL: "http://localhost:8101/api/",
  timeout: 10000,
  headers: {},
});

// 全局导出axios
export default instance;

// 全局导出axios响应的数据
// 添加响应拦截器,把后端返回的数据响应给前端
instance.interceptors.response.use(
  function (response) {
    const data = response.data;
    console.log(data);
    if (data.code === 0) {
      return data.data;
    }
    message.error("request error:" + data.message);
    return response.data;
  },
  function (error) {
    message.error("response error:" + error.message);
    return Promise.reject(error);
  }
);
