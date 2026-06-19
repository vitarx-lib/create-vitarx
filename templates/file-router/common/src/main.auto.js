import '@/assets/style.css'
import { createApp } from 'vitarx'
import App from './App.auto.jsx'
import router from './router/index.auto.js'

const app = createApp(App)
app.use(router)
app.mount('#root')
