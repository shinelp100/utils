/*自定义http请求做了如下事情：
*
* 1、添加自定义头X-Requested-With字段
*
* 2、处理post请求的参数qs序列化
*
* 3、添加X-CSRF-Token自定义头
*
* 4、app中自动获取token所有请求携带token
*
* 5、404、500等status错误码统一处理
*
*
* */

import axios from "axios"
import qs from "qs"


axios.defaults.headers.common = {
    "X-Requested-With": "XMLHttpRequest",
};

axios.interceptors.request.use(function (config) {
    if (config.method === "post") {
        config.data = qs.stringify(config.data);
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

export default axios;