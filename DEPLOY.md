# 远途记账 · 装到手机长期使用

本项目是 **PWA 网页应用**：部署到 Vercel 后，用手机浏览器「添加到主屏幕」，即可像 App 一样长期使用。数据保存在**手机浏览器本地**，无需上架应用商店。

---

## 一、准备 GitHub 仓库

在电脑上打开终端（PowerShell），执行：

```powershell
cd C:\Users\sj13\.cursor\projects\empty-window\yuantu-shouzhang

# 若尚未初始化 git
git init
git add .
git commit -m "远途记账：PWA + 本地持久化"
```

1. 打开 [https://github.com/new](https://github.com/new)
2. 仓库名例如：`yuantu-shouzhang`（选 **Public** 或 Private 均可）
3. **不要**勾选「Add a README」（本地已有代码）
4. 创建后，按 GitHub 页面提示执行（把 `你的用户名` 换成你的）：

```powershell
git remote add origin https://github.com/你的用户名/yuantu-shouzhang.git
git branch -M main
git push -u origin main
```

---

## 二、用 Vercel 免费部署（推荐）

1. 打开 [https://vercel.com](https://vercel.com)，用 **GitHub 账号登录**
2. 点击 **Add New… → Project**
3. **Import** 你刚推送的 `yuantu-shouzhang` 仓库
4. 保持默认即可：
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 **Deploy**，等待约 1～2 分钟
6. 完成后会得到网址，例如：`https://yuantu-shouzhang.vercel.app`

以后每次 `git push` 到 `main`，Vercel 会自动重新部署。

---

## 三、装到手机主屏幕

用手机 **Safari（iPhone）** 或 **Chrome（Android）** 打开 Vercel 给的 **https** 网址（必须 https）。

### iPhone

1. 用 **Safari** 打开网址（微信里打开往往无法安装，请复制链接到 Safari）
2. 点底部 **分享** 按钮
3. 选择 **「添加到主屏幕」**
4. 名称保持「远途记账」→ 添加

### Android

1. 用 **Chrome** 打开网址
2. 右上角 **⋮** 菜单
3. **「添加到主屏幕」** 或 **「安装应用」**
4. 确认

桌面上会出现图标，点开为全屏，体验接近独立 App。

---

## 四、数据存在哪里？

| 说明 | 详情 |
|------|------|
| 存储位置 | 手机浏览器 **localStorage**（本机） |
| 换手机 | 数据**不会**自动同步，需在新手机重新记账 |
| 清缓存 / 卸载 PWA | 可能**丢失**数据，重要行程请自行备份 |
| 上传的照片 | 以 Base64 存在本地，账本多了可能占空间 |

---

## 五、本地开发（可选）

```powershell
cd C:\Users\sj13\.cursor\projects\empty-window\yuantu-shouzhang
npm install
npm run dev
```

同一 WiFi 下手机预览：

```powershell
npm run dev -- --host
```

用手机浏览器打开终端里 `Network:` 那一行的地址。

---

## 六、常见问题

**Q：Vercel 部署失败？**  
确认仓库里已执行过本地 `npm run build` 无报错；在 Vercel 项目 Settings → General 里 Build Command 为 `npm run build`，Output 为 `dist`。

**Q：打开网页是空白？**  
确认已配置 `vercel.json`（本项目已包含 SPA 路由回退）。

**Q：iPhone 没有「添加到主屏幕」？**  
必须用 Safari，且是 https 链接。

**Q：想要多设备同步？**  
需要后续增加账号与云端数据库，当前版本仅本机存储。
