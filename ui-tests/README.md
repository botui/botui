
Before running local tests, run `clean` in the root to remove all node_modules.

Not using the local-react in this because the changes in @botui-react didn't trigger a re-build.

Use the following if you need to use 1 instance of react:
```
  "alias": {
    "react": "./node_modules/react",
    "react-dom": "./node_modules/react-dom"
  },
```