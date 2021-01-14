# headless-nprogress

Headless version of [nprogress](https://github.com/rstacruz/nprogress) for any JavaScript apps

```
yarn add @hanakla/headless-nprogress
```

## Usage 

Example with React

```tsx
import NProgress from "@hanakla/headless-nprogress"

// some router event handler
router.events.on('routeChangeStart', () => NProgress.start())
router.events.on('routeChangeCompleted', () => NProgress.done())

// in your hooks
const useNProgress = () => {
  const [state, setState] = useState({ progress: 0, visible: false})

  useEffect(() => {
    const callback = (progress, { started, finished }) => {
      setState(state => ({
        progress: progress * 100,
        visible: (state.visible || started) && !finished
      }))
    }

    NProgress.observeChange(callback)
    return () => NProgress.unobserveChange(callback)
  }, [])

  return state
}

const App = () => {
  const {progress, visible} = useNProgress()

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
      style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }} />
  )
}
```
