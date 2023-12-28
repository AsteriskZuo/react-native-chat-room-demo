## 跑通示例项目

该项目依赖 `AppServer` 服务器端项目，具体参考相应文档。
客户端编译运行参考下面的说明。

### 环境需求

使用该项目的要求：

- MacOS 12 或以上版本
- React-Native 0.66 或以上版本
- NodeJs 16.18 或以上版本

对于 `iOS` 应用：

- Xcode 13 或以上版本，以及它的相关依赖工具。

对于 `Android` 应用：

- Android Studio 2021 或以上版本，以及它的相关依赖工具。

### 账号准备

应用的创建和账号创建请到这里：[控制台](https://console.easemob.com/index)

### 下载项目

[下载地址](https://github.com/easemob/ChatroomDemo)

### 初始化配置

下载完成之后，打开项目的子目录 `rn`

```sh
cd rn
```

运行 `yarn` 初始化项目

```sh
yarn
```

生成配置文件

```sh
yarn run env
```

运行完成生成配置文件 `src/env.ts`.

文件内容如下：

```ts
export const isDevMode = true;
export const appKey = '';
export const accountType = 'easemob'; // agora or easemob
export const agoraAppId = '';
export const gAvatarUrlBasic = '';
export const gRegisterUserUrl = '';
export const gCreateRoomUrl = '';
export const gGetRoomListUrl = '';
export const account = [{ id: '', token: '' }];
```

### 填写必要参数

在生成的项目中必须填写 `appKey` `accountType`。 其中，`gAvatarUrlBasic` `gRegisterUserUrl` `gGetRoomListUrl` `gCreateRoomUrl` 这些参数来自 `AppServer` 服务器配置。

`account` 为默认界面默认使用的账号。

### 编译和运行项目

运行 ios 平台：

```sh
yarn run ios
```

运行 android 平台

```sh
yarn run android
```


