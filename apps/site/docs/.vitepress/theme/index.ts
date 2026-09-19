import DefaultTheme from 'vitepress/theme'
import HtmlFrame from './HtmlFrame.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HtmlFrame', HtmlFrame)
  },
}
