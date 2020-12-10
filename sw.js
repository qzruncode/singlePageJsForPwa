import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

precacheAndRoute(self.__WB_MANIFEST); // 传入 workbox-webpack-plugin 生成的 precache manifest 清单文件列表，用于缓存

// 使用 NetworkFirst模式 来处理导航请求(html)
// NetworkFirst：首先请求网络资源，如果收到响应将其保存到缓存中；如果网络请求失败，从缓存中取。
registerRoute(
    ({ request }) => {
        console.log(request);
        return request.mode === "navigate";
    }, // 导航请求
    new NetworkFirst({
        cacheName: "pages", // 将文件缓存到名为 pages 的cache中
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200], // 确保响应状态200的文件才能缓存
            }),
        ],
    })
);

// 使用 StaleWhileRevalidate模式 来处理css，js，web worker文件
// StaleWhileRevalidate：如果缓存中有就使用缓存的资源并且在后台默默的更新缓存中的文件，如果缓存中没有就用网络资源。缺点是会占用带宽
registerRoute(
    ({ request }) => {
        console.log(request);
        return request.destination === "style" || request.destination === "script" || request.destination === "worker";
    },
    new StaleWhileRevalidate({
        cacheName: "assets", // 将文件缓存到名为 assets 的cache中
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200], // 确保响应状态200的文件才能缓存
            }),
        ],
    })
);

// 使用 CacheFirst模式 来处理 image 资源
// CacheFirst：如果缓存中有就用缓存的，如果没有就用网络的并且添加到缓存中
registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200], // 确保响应状态200的文件才能缓存
            }),
            new ExpirationPlugin({ // 不能缓存超过50个文件，有效期不能超过30天
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30天
                purgeOnQuotaError: true, // 如果超过浏览器的存储配额将自动清除
            }),
        ],
    })
);
