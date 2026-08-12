// 云端同步配置（Firebase Realtime Database）
// 填好后，电脑 / 手机 / 朋友打开同一网站就能共同编辑
//
// 怎么开通（约 3 分钟）：
// 1. 打开 https://console.firebase.google.com/ 登录 Google 账号
// 2. 添加项目（名称随意，如 hawaii-trip）
// 3. 项目里点「Realtime Database」→ 创建数据库 → 选测试模式（test mode）
// 4. 项目设置 → 通用 → 你的应用 → </> Web → 注册应用，复制 firebaseConfig
// 5. 把下面的值替换成你的配置，保存后重新部署 / 上传此文件
//
// 数据库规则（测试用，仅限朋友小范围）：
// {
//   "rules": {
//     "trips": {
//       ".read": true,
//       ".write": true
//     }
//   }
// }

window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// 所有人用同一个 trip id，就会读写同一份行程
window.TRIP_CLOUD_ID = "yaoxin-hawaii-2026";
