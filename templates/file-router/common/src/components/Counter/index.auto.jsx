import { ref } from 'vitarx'

export default function Counter() {
  const count = ref(0)

  return (
    <div class='counter-inner'>
      <div class='counter-label'>响应式计数器演示</div>
      <div class='counter-value'>{count}</div>
      <div class='counter-buttons'>
        <button class='counter-btn' onClick={() => count.value--}>
          −
        </button>
        <button class='counter-btn counter-btn-reset' onClick={() => (count.value = 0)}>
          RESET
        </button>
        <button class='counter-btn' onClick={() => count.value++}>
          +
        </button>
      </div>
    </div>
  )
}
