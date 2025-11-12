{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red109\green115\blue120;\red23\green24\blue24;\red202\green202\blue202;
\red183\green111\blue247;\red54\green192\blue160;\red212\green212\blue212;\red113\green192\blue131;\red246\green124\blue48;
}
{\*\expandedcolortbl;;\cssrgb\c50196\c52549\c54510;\cssrgb\c11765\c12157\c12549;\cssrgb\c83137\c83137\c83137;
\cssrgb\c77255\c54118\c97647;\cssrgb\c23922\c78824\c69020;\cssrgb\c86275\c86275\c86275;\cssrgb\c50588\c78824\c58431;\cssrgb\c98039\c56471\c24314;
}
\margl1440\margr1440\vieww34000\viewh20240\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // Name of the cache storage\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf4 \strokec4  \cf6 \strokec6 CACHE_NAME\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf8 \strokec8 'dram-tracker-cache-v1'\cf7 \strokec7 ;\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 // List of all files the Service Worker should cache immediately\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf4 \strokec4  urlsToCache \cf7 \strokec7 =\cf4 \strokec4  \cf7 \strokec7 [\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3     \cf8 \strokec8 '/'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 '/index.html'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 '/manifest.json'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'icon-192.png'\cf7 \strokec7 ,\cf4 \strokec4  \cf2 \strokec2 // You'll need to create these image files\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'icon-512.png'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 // Important CDN assets needed for the app to run offline\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'https://cdn.tailwindcss.com'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js'\cf7 \strokec7 ,\cf4 \strokec4  \cf2 \strokec2 // Use production version for better speed\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'https://unpkg.com/@babel/standalone/babel.min.js'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'https://unpkg.com/lucide@latest'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 'https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js'\cf7 \strokec7 ,\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 ];\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 // --- INSTALL EVENT ---\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 self\cf7 \strokec7 .\cf4 \strokec4 addEventListener\cf7 \strokec7 (\cf8 \strokec8 'install'\cf7 \strokec7 ,\cf4 \strokec4  \cf7 \strokec7 (\cf4 \strokec4 event\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3     event\cf7 \strokec7 .\cf4 \strokec4 waitUntil\cf7 \strokec7 (\cf4 \cb1 \strokec4 \
\cb3         caches\cf7 \strokec7 .\cf4 \strokec4 open\cf7 \strokec7 (\cf6 \strokec6 CACHE_NAME\cf7 \strokec7 )\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 .\cf4 \strokec4 then\cf7 \strokec7 ((\cf4 \strokec4 cache\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                 console\cf7 \strokec7 .\cf4 \strokec4 log\cf7 \strokec7 (\cf8 \strokec8 'SW: Pre-caching essential assets.'\cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3                 \cf5 \strokec5 return\cf4 \strokec4  cache\cf7 \strokec7 .\cf4 \strokec4 addAll\cf7 \strokec7 (\cf4 \strokec4 urlsToCache\cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 \})\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 .\cf5 \strokec5 catch\cf7 \strokec7 (\cf4 \strokec4 err \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                 console\cf7 \strokec7 .\cf4 \strokec4 error\cf7 \strokec7 (\cf8 \strokec8 'SW: Failed to pre-cache assets:'\cf7 \strokec7 ,\cf4 \strokec4  err\cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 \})\cf4 \cb1 \strokec4 \
\cb3     \cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 \});\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 // --- FETCH EVENT ---\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 self\cf7 \strokec7 .\cf4 \strokec4 addEventListener\cf7 \strokec7 (\cf8 \strokec8 'fetch'\cf7 \strokec7 ,\cf4 \strokec4  \cf7 \strokec7 (\cf4 \strokec4 event\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3     event\cf7 \strokec7 .\cf4 \strokec4 respondWith\cf7 \strokec7 (\cf4 \cb1 \strokec4 \
\cb3         caches\cf7 \strokec7 .\cf4 \strokec4 match\cf7 \strokec7 (\cf4 \strokec4 event\cf7 \strokec7 .\cf4 \strokec4 request\cf7 \strokec7 )\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 .\cf4 \strokec4 then\cf7 \strokec7 ((\cf4 \strokec4 response\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                 \cf5 \strokec5 if\cf4 \strokec4  \cf7 \strokec7 (\cf4 \strokec4 response\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                     \cf5 \strokec5 return\cf4 \strokec4  response\cf7 \strokec7 ;\cf4 \strokec4  \cf2 \strokec2 // Cache hit\cf4 \cb1 \strokec4 \
\cb3                 \cf7 \strokec7 \}\cf4 \cb1 \strokec4 \
\cb3                 \cb1 \
\cb3                 \cf5 \strokec5 return\cf4 \strokec4  fetch\cf7 \strokec7 (\cf4 \strokec4 event\cf7 \strokec7 .\cf4 \strokec4 request\cf7 \strokec7 ).\cf4 \strokec4 then\cf7 \strokec7 (\cf4 \cb1 \strokec4 \
\cb3                     \cf7 \strokec7 (\cf4 \strokec4 response\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                         \cf2 \strokec2 // Skip caching Firebase transactions or large external data\cf4 \cb1 \strokec4 \
\cb3                         \cf5 \strokec5 if\cf4 \strokec4  \cf7 \strokec7 (!\cf4 \strokec4 response \cf7 \strokec7 ||\cf4 \strokec4  response\cf7 \strokec7 .\cf4 \strokec4 status \cf7 \strokec7 !==\cf4 \strokec4  \cf9 \strokec9 200\cf4 \strokec4  \cf7 \strokec7 ||\cf4 \strokec4  response\cf7 \strokec7 .\cf4 \strokec4 type \cf7 \strokec7 !==\cf4 \strokec4  \cf8 \strokec8 'basic'\cf4 \strokec4  \cf7 \strokec7 ||\cf4 \strokec4  \cb1 \
\cb3                             event\cf7 \strokec7 .\cf4 \strokec4 request\cf7 \strokec7 .\cf4 \strokec4 url\cf7 \strokec7 .\cf4 \strokec4 includes\cf7 \strokec7 (\cf8 \strokec8 'firebase'\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 ||\cf4 \strokec4  event\cf7 \strokec7 .\cf4 \strokec4 request\cf7 \strokec7 .\cf4 \strokec4 url\cf7 \strokec7 .\cf4 \strokec4 includes\cf7 \strokec7 (\cf8 \strokec8 'googleapis'\cf7 \strokec7 ))\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                             \cf5 \strokec5 return\cf4 \strokec4  response\cf7 \strokec7 ;\cf4 \cb1 \strokec4 \
\cb3                         \cf7 \strokec7 \}\cf4 \cb1 \strokec4 \
\
\cb3                         \cf5 \strokec5 const\cf4 \strokec4  responseToCache \cf7 \strokec7 =\cf4 \strokec4  response\cf7 \strokec7 .\cf4 \strokec4 clone\cf7 \strokec7 ();\cf4 \cb1 \strokec4 \
\cb3                         \cb1 \
\cb3                         caches\cf7 \strokec7 .\cf4 \strokec4 open\cf7 \strokec7 (\cf6 \strokec6 CACHE_NAME\cf7 \strokec7 )\cf4 \cb1 \strokec4 \
\cb3                             \cf7 \strokec7 .\cf4 \strokec4 then\cf7 \strokec7 ((\cf4 \strokec4 cache\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                                 cache\cf7 \strokec7 .\cf4 \strokec4 put\cf7 \strokec7 (\cf4 \strokec4 event\cf7 \strokec7 .\cf4 \strokec4 request\cf7 \strokec7 ,\cf4 \strokec4  responseToCache\cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3                             \cf7 \strokec7 \});\cf4 \cb1 \strokec4 \
\
\cb3                         \cf5 \strokec5 return\cf4 \strokec4  response\cf7 \strokec7 ;\cf4 \cb1 \strokec4 \
\cb3                     \cf7 \strokec7 \}\cf4 \cb1 \strokec4 \
\cb3                 \cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 \})\cf4 \cb1 \strokec4 \
\cb3     \cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 \});\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 // --- ACTIVATE EVENT ---\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 self\cf7 \strokec7 .\cf4 \strokec4 addEventListener\cf7 \strokec7 (\cf8 \strokec8 'activate'\cf7 \strokec7 ,\cf4 \strokec4  \cf7 \strokec7 (\cf4 \strokec4 event\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  cacheWhitelist \cf7 \strokec7 =\cf4 \strokec4  \cf7 \strokec7 [\cf6 \strokec6 CACHE_NAME\cf7 \strokec7 ];\cf4 \cb1 \strokec4 \
\cb3     event\cf7 \strokec7 .\cf4 \strokec4 waitUntil\cf7 \strokec7 (\cf4 \cb1 \strokec4 \
\cb3         caches\cf7 \strokec7 .\cf4 \strokec4 keys\cf7 \strokec7 ().\cf4 \strokec4 then\cf7 \strokec7 ((\cf4 \strokec4 cacheNames\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3             \cf5 \strokec5 return\cf4 \strokec4  \cf6 \strokec6 Promise\cf7 \strokec7 .\cf4 \strokec4 all\cf7 \strokec7 (\cf4 \cb1 \strokec4 \
\cb3                 cacheNames\cf7 \strokec7 .\cf4 \strokec4 map\cf7 \strokec7 ((\cf4 \strokec4 cacheName\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 =>\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                     \cf5 \strokec5 if\cf4 \strokec4  \cf7 \strokec7 (\cf4 \strokec4 cacheWhitelist\cf7 \strokec7 .\cf4 \strokec4 indexOf\cf7 \strokec7 (\cf4 \strokec4 cacheName\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 ===\cf4 \strokec4  \cf7 \strokec7 -\cf9 \strokec9 1\cf7 \strokec7 )\cf4 \strokec4  \cf7 \strokec7 \{\cf4 \cb1 \strokec4 \
\cb3                         \cf5 \strokec5 return\cf4 \strokec4  caches\cf7 \strokec7 .\cf5 \strokec5 delete\cf7 \strokec7 (\cf4 \strokec4 cacheName\cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3                     \cf7 \strokec7 \}\cf4 \cb1 \strokec4 \
\cb3                 \cf7 \strokec7 \})\cf4 \cb1 \strokec4 \
\cb3             \cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\cb3         \cf7 \strokec7 \})\cf4 \cb1 \strokec4 \
\cb3     \cf7 \strokec7 );\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 \});\cf4 \cb1 \strokec4 \
}