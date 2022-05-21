function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "BOTUI_TYPES", () => $aac6481c8c4c4182$export$ac3c3ce1f9647d72);
$parcel$export(module.exports, "botuiControl", () => $aac6481c8c4c4182$export$1a73a45e1a4c3059);
const $aac6481c8c4c4182$export$ac3c3ce1f9647d72 = {
    ACTION: 'action',
    MESSAGE: 'message'
};
function $aac6481c8c4c4182$var$createBlock(type, meta, data) {
    return {
        type: type,
        meta: meta,
        data: data
    };
}
function $aac6481c8c4c4182$var$resolveManager() {
    let resolver = (...args)=>{};
    return {
        set: (callback)=>{
            resolver = callback;
        },
        resolve: (...args)=>resolver(...args)
    };
}
function $aac6481c8c4c4182$var$messageManager(callback = (history = [])=>{}) {
    let history = [];
    return {
        getAll: ()=>history
        ,
        get: (index = 0)=>history[index]
        ,
        add: (block)=>{
            const length = history.push(block);
            callback(history);
            return length - 1;
        },
        update: (index, block)=>{
            history[index] = block;
            callback(history);
        },
        remove: (index)=>{
            history.splice(index, 1);
            callback(history);
        },
        clear: ()=>{
            history = [];
            callback(history);
        }
    };
}
function $aac6481c8c4c4182$var$actionManager(callback = (action)=>{}) {
    let currentAction = null;
    return {
        get: ()=>currentAction
        ,
        set: (action)=>{
            currentAction = action;
            callback(currentAction);
        },
        clear: ()=>{
            currentAction = null;
            callback(currentAction);
        }
    };
}
const $aac6481c8c4c4182$export$1a73a45e1a4c3059 = ()=>{
    const plugins = [];
    const stateResolver = $aac6481c8c4c4182$var$resolveManager();
    const callbacks = {
        [$aac6481c8c4c4182$export$ac3c3ce1f9647d72.MESSAGE]: ()=>{},
        [$aac6481c8c4c4182$export$ac3c3ce1f9647d72.ACTION]: ()=>{}
    };
    const doCallback = (state = '', data)=>{
        const callback = callbacks[state];
        callback(data);
    };
    const runWithPlugins = (input)=>{
        let output = input;
        plugins.forEach((plugin)=>{
            output = plugin?.(input);
        });
        return output;
    };
    const msg = $aac6481c8c4c4182$var$messageManager((history)=>{
        doCallback($aac6481c8c4c4182$export$ac3c3ce1f9647d72.MESSAGE, history);
    });
    const currentAction = $aac6481c8c4c4182$var$actionManager((action)=>{
        doCallback($aac6481c8c4c4182$export$ac3c3ce1f9647d72.ACTION, action);
    });
    const botuiInterface = {
        message: {
            add: (data = {
                text: ''
            }, meta = {})=>{
                return new Promise((resolve)=>{
                    stateResolver.set(resolve);
                    const index = msg.add(runWithPlugins($aac6481c8c4c4182$var$createBlock($aac6481c8c4c4182$export$ac3c3ce1f9647d72.MESSAGE, meta, data)));
                    stateResolver.resolve(index);
                });
            },
            getAll: ()=>Promise.resolve(msg.getAll())
            ,
            get: (index = 0)=>Promise.resolve(msg.get(index))
            ,
            remove: (index = 0)=>{
                msg.remove(index);
                return Promise.resolve();
            },
            update: (index = 0, block)=>{
                msg.update(index, runWithPlugins(block));
                return Promise.resolve();
            },
            removeAll: ()=>{
                msg.clear();
                return Promise.resolve();
            }
        },
        action: (data = {
            text: ''
        }, meta = {})=>{
            return new Promise((resolve)=>{
                const action = $aac6481c8c4c4182$var$createBlock($aac6481c8c4c4182$export$ac3c3ce1f9647d72.ACTION, meta, data);
                currentAction.set(action);
                stateResolver.set((...args)=>{
                    currentAction.clear();
                    if (meta.ephemeral !== true) msg.add($aac6481c8c4c4182$var$createBlock($aac6481c8c4c4182$export$ac3c3ce1f9647d72.MESSAGE, {
                        type: $aac6481c8c4c4182$export$ac3c3ce1f9647d72.ACTION
                    }, ...args));
                    resolve(...args);
                });
            });
        },
        wait: (meta = {
            waitTime: 0
        })=>{
            console.log(meta);
            meta.waiting = true;
            meta.ephemeral = true // to not add to message history
            ;
            if (meta?.waitTime) setTimeout(()=>botuiInterface.next(meta)
            , meta.waitTime);
            return botuiInterface.action({}, meta);
        },
        onChange: (state, cb)=>{
            callbacks[state] = cb;
            return botuiInterface;
        },
        next: (...args)=>{
            stateResolver.resolve(...args);
            return botuiInterface;
        },
        use: (plugin)=>{
            plugins.push(plugin);
            return botuiInterface;
        }
    };
    return botuiInterface;
};


//# sourceMappingURL=botui.js.map
