const APP = 'zeenat-v15';
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(APP).then(function(c){ return c.addAll(['./zeenat15.html', './zeenat15.webmanifest']); }).catch(function(){}));
});
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  const req = e.request;
  const u = new URL(req.url);
  if(req.method === 'POST' && u.pathname.endsWith('/share-target')){
    e.respondWith((async function(){
      try{
        const fd = await req.formData();
        const files = fd.getAll('lists');
        const cache = await caches.open('share');
        const old = await cache.keys();
        for(const k of old){ await cache.delete(k); }
        let i = 0;
        for(const f of files){
          await cache.put(new URL('shared/' + (i++), self.registration.scope).href, new Response(f));
        }
        return Response.redirect(new URL('zeenat15.html?shared=' + i, self.registration.scope).href, 303);
      }catch(err){
        return Response.redirect(new URL('zeenat15.html', self.registration.scope).href, 303);
      }
    })());
    return;
  }
  if(req.method === 'GET' && u.origin === location.origin){
    e.respondWith(fetch(req).then(function(r){
      const copy = r.clone();
      caches.open(APP).then(function(c){ c.put(req, copy); }).catch(function(){});
      return r;
    }).catch(function(){ return caches.match(req); }));
  }
});
