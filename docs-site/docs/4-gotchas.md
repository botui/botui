
# Gotchas and Known Issues


## Auto-resolving bot

Sometimes, especially in development envoirnment, it would seem like you bot does not wait and resolves itself. Event the actions resolve with undefined data. That happens usually when the dev env hot-reloads and initial code (e.g: `useEffect`) is called multiple times. To fix this, make sure you start your bot only once.

Here's an example of fix in React:

```js
const runBot = (bot: BotuiInterface) => {
  bot.message.add({ text: "hello" })
}

let timer: NodeJS.Timeout

export const HomeBot = () => {
  const botRef = useRef(createBot())
  const mybot = botRef.current

  useEffect(() => {
    clearTimeout(timer) // makes sure to clear previous call
    timer = setTimeout(() => runBot(mybot), 100)
  })

  return <>...</>
}
```