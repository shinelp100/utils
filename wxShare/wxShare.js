const $ = require('jquery')
const wx = require('weixin-js-sdk')

var wxShare = {
  /**初始化不用配置微信分享参数**/
  initParams: {
    title: "",
    des: "",
    link: "",
    imgUrl: "",
    appId: "",
    activeUrl:"",
    obj:""
  },
  shareTag: ".share-btn",
  init: function () {
    this.panel(this.initParams);
  },
  /**设置微信分享参数**/
  setParams: function (title, des, link, imgUrl, appId,activeUrl) {
    this.initParams.title = title;
    this.initParams.des = des;
    this.initParams.link = link;
    this.initParams.imgUrl = imgUrl;
    this.initParams.appId = appId;
    this.initParams.activeUrl = activeUrl;
    if(activeUrl){
      this.panel(this.initParams);
    }
    this.wxPageShare(this.initParams);
  },
  /**判断浏览器终端**/
  versions: function () {
    var ua = navigator.userAgent.toLocaleLowerCase();
    return {//移动终端浏览器版本信息
      ios: ua.indexOf('njqapple') > -1, //njq ios终端
      iosWJF: ua.indexOf('wjfapple') > -1, //wjf ios终端
      android: ua.indexOf('njqandroid') > -1, //njq android终端或者uc浏览器
      androidWJF: ua.indexOf('wjfandroid') > -1, //wjf  android终端或者uc浏览器
    };
  },
  /**调用app面板还是微信遮罩**/
  panel: function (params) {
    var version = this.versions();
    $('body,document').on('click', wxShare.shareTag, function () {
      //分享四要素(标题+描述+链接地址+图标地址)
      var shareObj = {title: params.title, des: params.des, linkurl: params.link, thumurl: params.imgUrl};
      if (version.ios || version.iosWJF) {
        //苹果设备
        window.webkit.messageHandlers.share.postMessage(shareObj);
        $.get(params.activeUrl+'?scene=timeline&shareUrl='+encodeURIComponent(location.href));
      } else if (version.android || version.androidWJF) {
        //android 设备,四个参数位置不可颠倒
        window.shareAction.share(params.title, params.des, params.link, params.imgUrl);
        $.get(params.activeUrl+'?scene=timeline&shareUrl='+encodeURIComponent(location.href));
      } else {
        //其它
        wxShare.popShare();
      }
    });

  },
  /*微信分享页面配置信息*/
  wxPageShare: function (params) {
    $.get("/weixin/auth", {
      appId: 1,
      url: location.protocol + '\/\/' + location.hostname + location.pathname + location.search
    }, function (data) {
      wx.config({
        /*debug: true,*/
        appId: params.appId, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature,// 必填，签名，见附录1
        jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });

      wx.ready(function () {
        wx.onMenuShareAppMessage({
          title: params.title, // 分享标题
          desc: params.des, // 分享描述
          link: params.link, // 分享链接
          imgUrl: params.imgUrl, // 分享图标
          success: function () {
            $('body,document').trigger('click');
            wxShare.AppMessageSuccessCallBack();
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
            $('body,document').trigger('click');
            wxShare.cancelCallBack();
          }
        });
        wx.onMenuShareTimeline({
          title: params.title, // 分享标题
          link: params.link, // 分享链接
          imgUrl: params.imgUrl, // 分享图标
          success: function () {
            $('body,document').trigger('click');
            wxShare.TimelineSuccessCallBack();
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
            $('body,document').trigger('click');
            wxShare.cancelCallBack();
          }
        });
      });
      wx.error(function (res) {
        console.log(res);
      });
    });
  },
  /**添加微信遮罩层+绑定事件**/
  popShare: function () {
    var html = '<div class="mark-box" style="cursor:pointer;position: fixed;left: 0;bottom:0;width: 100%;height: 100%;background: #000;opacity: 0.6;z-index: 1000000;" ></div>'
      + '<div class="share-box" style="cursor:pointer;position: fixed;left: 0;bottom:0;width: 100%;height: 100%;z-index: 1000002;text-align: right;">'
      + '<img class="share-box-img" style="cursor:pointer;float: right;width: 80%;" src="https://static.wenjf.com/v2/wap/campaigns/active20170711/img/weixinShare.png" alt="">'
      + '</div>';
    $('body').prepend(html).on('click', function (e) {
      if ($(e.target).hasClass('share-box') || $(e.target).hasClass('share-box-img') || $(e.target).children('div').hasClass('share-box')) {
        $('.share-box').remove();
        $('.mark-box').remove();
      }
    });
  },
  AppMessageSuccessCallBack: function () {
    //用户微信发送给好友成功后的回调
  },
  TimelineSuccessCallBack: function () {
    //用户微信朋友圈分享成功后的回调
  },
  cancelCallBack: function () {
    //用户取消对应做的处理
  }
};
module.exports = wxShare;